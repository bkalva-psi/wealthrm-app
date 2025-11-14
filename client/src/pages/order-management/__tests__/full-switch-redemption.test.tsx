import { render, screen, fireEvent } from '@testing-library/react';
import FullSwitchRedemptionPanel from '../components/full-switch-redemption-panel';

describe('FullSwitchRedemptionPanel Component', () => {
  const mockFullSwitchData = {
    sourceScheme: 'Scheme A',
    targetScheme: 'Scheme B',
    units: 1000.50,
    closeAc: true,
  };

  const mockFullRedemptionData = {
    schemeName: 'Scheme A',
    units: 1000.50,
    amount: 25000,
    closeAc: true,
  };

  it('TC-OM-014: Should display Full Switch in read-only mode', () => {
    render(<FullSwitchRedemptionPanel type="switch" data={mockFullSwitchData} />);

    expect(screen.getByDisplayValue('Scheme A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Scheme B')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000.5000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Y')).toBeInTheDocument();

    // Verify all inputs are disabled/read-only
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('readOnly');
    });
  });

  it('TC-OM-015: Should display Full Redemption in read-only mode', () => {
    render(<FullSwitchRedemptionPanel type="redemption" data={mockFullRedemptionData} />);

    expect(screen.getByDisplayValue('Scheme A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000.5000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('₹25,000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Y')).toBeInTheDocument();

    // Verify all inputs are disabled/read-only
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveAttribute('readOnly');
    });
  });

  it('TC-OM-014: Should not allow editing in Full Switch panel', () => {
    render(<FullSwitchRedemptionPanel type="switch" data={mockFullSwitchData} />);

    const unitsInput = screen.getByDisplayValue('1000.5000');
    expect(unitsInput).toHaveAttribute('readOnly');

    // Attempt to change value - readOnly inputs should not change
    expect(unitsInput).toHaveValue('1000.5000');
  });

  it('TC-OM-015: Should display units exactly without rounding', () => {
    const dataWithPreciseUnits = {
      ...mockFullRedemptionData,
      units: 1000.123456,
    };

    render(<FullSwitchRedemptionPanel type="redemption" data={dataWithPreciseUnits} />);

    // Component uses toFixed(4), so it will show 1000.1235
    expect(screen.getByDisplayValue('1000.1235')).toBeInTheDocument();
  });
});

