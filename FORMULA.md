# ROI Calculator Formula

This calculator uses a direct time-loss model instead of an inferred "hidden cost" model.

## Inputs

- `D`: number of developers
- `H`: hours lost per developer per week to decision archaeology
- `S`: average annual salary per developer

## Constants

- `B = 1.25`: burden multiplier for fully loaded cost
- `Q = 0.60`: recovery rate with Verachi
- `W = 52`: weeks per year
- `Y = 2080`: work hours per year

## Core Formula

```text
loaded_hourly_rate = (S * B) / Y

annual_hours_lost = D * H * W

annual_cost_without_verachi = annual_hours_lost * loaded_hourly_rate

hours_reclaimed = annual_hours_lost * Q

annual_savings = hours_reclaimed * loaded_hourly_rate
```

## Graph Formula

The graph shows cumulative cost over 12 months with a pivot at month 6.

```text
monthly_cost_without = annual_cost_without_verachi / 12

monthly_cost_with = monthly_cost_without * (1 - Q)

without_verachi(m) = m * monthly_cost_without

with_verachi(m) =
  if m <= 6:
    m * monthly_cost_without
  else:
    6 * monthly_cost_without + (m - 6) * monthly_cost_with
```

## Default Example

Inputs:

- `D = 6`
- `H = 1`
- `S = 120000`

Results:

```text
loaded_hourly_rate = (120000 * 1.25) / 2080 = 72.12

annual_hours_lost = 6 * 1 * 52 = 312

hours_reclaimed = 312 * 0.60 = 187.2

annual_savings = 187.2 * 72.12 = 13500
```

Rounded UI values:

- `Estimated Annual Savings = $13,500`
- `Hours Reclaimed / Year = 187`
