import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityFormModal } from '../src/components/ActivityFormModal';
import { Activity } from '../src/types/activities';

describe('ActivityFormModal', () => {
  const planStartDate = '2026-08-01';
  const planEndDate = '2026-08-10';

  describe('create mode', () => {
    it('renders all fields: name, date, startTime, endTime, cost, category, location, description', () => {
      render(
        <ActivityFormModal
          planStartDate={planStartDate}
          planEndDate={planEndDate}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cost/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('submit button disabled when name is empty', () => {
      render(
        <ActivityFormModal
          planStartDate={planStartDate}
          planEndDate={planEndDate}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const submitButton = screen.getByRole('button', { name: /save/i });
      expect(submitButton).toBeDisabled();
    });

    it('shows validation error when endTime is before startTime', async () => {
      render(
        <ActivityFormModal
          planStartDate={planStartDate}
          planEndDate={planEndDate}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const nameInput = screen.getByLabelText(/name/i);
      const startTimeInput = screen.getByLabelText(/start time/i);
      const endTimeInput = screen.getByLabelText(/end time/i);

      await userEvent.type(nameInput, 'Test Activity');
      await userEvent.type(startTimeInput, '14:00');
      await userEvent.type(endTimeInput, '12:00');

      await waitFor(() => {
        expect(screen.getByText(/end time must be after start time/i)).toBeInTheDocument();
      });
    });

    it('shows validation error when cost is negative', async () => {
      render(
        <ActivityFormModal
          planStartDate={planStartDate}
          planEndDate={planEndDate}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const nameInput = screen.getByLabelText(/name/i);
      const costInput = screen.getByLabelText(/cost/i);

      await userEvent.type(nameInput, 'Test Activity');
      await userEvent.clear(costInput);
      await userEvent.type(costInput, '-10');

      await waitFor(() => {
        expect(screen.getByText(/cost cannot be negative/i)).toBeInTheDocument();
      });
    });

    it('calls onSubmit with correct data when form is valid', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(
        <ActivityFormModal
          planStartDate={planStartDate}
          planEndDate={planEndDate}
          onSubmit={onSubmit}
          onCancel={vi.fn()}
        />
      );

      await userEvent.type(screen.getByLabelText(/name/i), 'Museum Visit');
      await userEvent.type(screen.getByLabelText(/date/i), '2026-08-05');
      await userEvent.type(screen.getByLabelText(/start time/i), '10:00');
      await userEvent.type(screen.getByLabelText(/end time/i), '12:00');
      await userEvent.clear(screen.getByLabelText(/cost/i));
      await userEvent.type(screen.getByLabelText(/cost/i), '25');
      await userEvent.selectOptions(screen.getByLabelText(/category/i), 'sightseeing');
      await userEvent.type(screen.getByLabelText(/location/i), 'Louvre');
      await userEvent.type(screen.getByLabelText(/description/i), 'Famous art museum');

      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          name: 'Museum Visit',
          date: '2026-08-05',
          startTime: '10:00',
          endTime: '12:00',
          cost: 25,
          category: 'sightseeing',
          location: 'Louvre',
          description: 'Famous art museum',
        });
      });
    });

    it('shows current and projected remaining budget', async () => {
      render(
        <ActivityFormModal
          planStartDate={planStartDate}
          planEndDate={planEndDate}
          remainingBudget={500}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.getByText(/current remaining budget/i)).toBeInTheDocument();
      expect(screen.getAllByText('$500').length).toBeGreaterThan(0);

      const costInput = screen.getByLabelText(/cost/i);
      await userEvent.clear(costInput);
      await userEvent.type(costInput, '125');

      await waitFor(() => {
        expect(screen.getByText('$375')).toBeInTheDocument();
      });
    });

    it('shows warning when projected remaining budget falls below zero', async () => {
      render(
        <ActivityFormModal
          planStartDate={planStartDate}
          planEndDate={planEndDate}
          remainingBudget={50}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const nameInput = screen.getByLabelText(/name/i);
      const costInput = screen.getByLabelText(/cost/i);

      await userEvent.type(nameInput, 'Expensive item');
      await userEvent.clear(costInput);
      await userEvent.type(costInput, '120');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/will exceed your budget/i);
      });

      expect(screen.getByRole('button', { name: /save/i })).toBeEnabled();
    });
  });

  describe('edit mode', () => {
    const existingActivity: Activity = {
      id: 'a1',
      planId: 'p1',
      name: 'Existing Activity',
      date: '2026-08-03',
      startTime: '14:00',
      endTime: '16:00',
      cost: 50,
      category: 'dining',
      location: 'Restaurant',
      description: 'Nice place',
    };

    it('pre-populates all fields with existing activity data', () => {
      render(
        <ActivityFormModal
          activity={existingActivity}
          planStartDate={planStartDate}
          planEndDate={planEndDate}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.getByLabelText(/name/i)).toHaveValue('Existing Activity');
      expect(screen.getByLabelText(/date/i)).toHaveValue('2026-08-03');
      expect(screen.getByLabelText(/start time/i)).toHaveValue('14:00');
      expect(screen.getByLabelText(/end time/i)).toHaveValue('16:00');
      expect(screen.getByLabelText(/cost/i)).toHaveValue(50);
      expect(screen.getByLabelText(/category/i)).toHaveValue('dining');
      expect(screen.getByLabelText(/location/i)).toHaveValue('Restaurant');
      expect(screen.getByLabelText(/description/i)).toHaveValue('Nice place');
    });

    it('cancel button calls onCancel', async () => {
      const onCancel = vi.fn();
      render(
        <ActivityFormModal
          activity={existingActivity}
          planStartDate={planStartDate}
          planEndDate={planEndDate}
          onSubmit={vi.fn()}
          onCancel={onCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
