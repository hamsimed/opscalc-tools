// V4 content: new calculators, structured "common mistakes" / "where it's used" lists, category landing pages.
// Rule unchanged: no invented statistics; conventions are labelled as conventions.

export const newPages = [
  {
    id: 'teep', category: 'production', title: 'TEEP Calculator',
    seoTitle: 'TEEP Calculator – Total Effective Equipment Performance',
    description: 'Calculate TEEP from OEE, planned production time and calendar time, and see how much capacity the schedule leaves unused.',
    intro: 'Total Effective Equipment Performance (TEEP) measures good output against all calendar time, not only planned time. It combines OEE with loading (the share of the calendar you schedule), so it shows how much hidden capacity exists before you buy new equipment.',
    formulas: ['Loading = Planned production time ÷ Calendar time', 'TEEP = OEE × Loading'],
    vars: [['OEE', 'Overall equipment effectiveness over the planned time', '%'], ['Planned production time', 'Hours scheduled to run in the period', 'h'], ['Calendar time', 'All hours in the period (24 × days)', 'h']],
    exampleContext: 'A packaging line runs two shifts on five days (120 scheduled hours per 168-hour week) and achieves 65% OEE.',
    sections: [
      { h: 'OEE or TEEP?', html: '<p>OEE answers “how well do we use the time we planned?”. TEEP answers “how well do we use all the time that exists?”. A plant can have good OEE and low TEEP if it runs only one shift. That gap is the cheapest capacity available: adding a shift or reducing planned downtime usually costs less than a new machine.</p>' },
      { h: 'Using TEEP in capacity decisions', html: '<p>Before approving an investment for more capacity, compare required output with output at a realistic TEEP. If the existing asset could meet demand with an extra shift and modest OEE improvement, the investment case should be weighed against those options. Use the <a href="/calculators/oee">OEE calculator</a> to break down the losses inside planned time.</p>' }
    ],
    mistakes: ['Using planned time as the TEEP denominator: that gives OEE, not TEEP.', 'Mixing periods: OEE measured over a month with calendar hours of a week.', 'Treating low TEEP as an equipment problem when the cause is the schedule.'],
    applications: ['Capacity studies before capital investment.', 'Comparing shift patterns (2 × 8 h, 3 × 8 h, continuous).', 'Bottleneck analysis on continuous-process lines.'],
    faq: [{ q: 'Can TEEP be higher than OEE?', a: 'No. TEEP equals OEE multiplied by loading, which is at most 100%. TEEP equals OEE only for equipment scheduled 24 hours a day, every day.' }],
    related: ['oee', 'capacity-utilization', 'takt-time', 'availability']
  },
  {
    id: 'pump-power', category: 'energy', title: 'Pump Power Calculator',
    seoTitle: 'Pump Power Calculator – Hydraulic, Shaft & Input kW',
    description: 'Calculate pump hydraulic power, shaft power and electrical input from flow, head, density and efficiencies, with optional annual energy use.',
    intro: 'Pump power follows directly from flow, head and fluid density. This calculator gives hydraulic power, the shaft power the motor must deliver, and the electrical power drawn from the supply, so you can size a motor or estimate energy cost at the duty point.',
    formulas: ['Hydraulic power (kW) = ρ × g × Q × H ÷ 1,000', 'Shaft power = Hydraulic power ÷ Pump efficiency', 'Electrical input = Shaft power ÷ Motor efficiency'],
    vars: [['ρ', 'Fluid density', 'kg/m³'], ['g', 'Gravitational acceleration, 9.80665', 'm/s²'], ['Q', 'Flow rate (converted from m³/h to m³/s)', 'm³/s'], ['H', 'Total dynamic head at the duty point', 'm']],
    exampleContext: 'A process water pump delivers 180 m³/h against 45 m of total head. The pump is 72% efficient at that point, the motor 94%, and it runs 6,000 hours a year.',
    sections: [
      { h: 'Reading the result', html: '<p>Wire-to-water efficiency (hydraulic power ÷ electrical input) summarises the whole pumping set. Values well below the pump’s best-efficiency figure suggest the pump runs away from its best efficiency point, often because of oversizing or throttling. The <a href="/calculators/affinity-laws">affinity laws calculator</a> estimates what speed control could save.</p>' },
      { h: 'Total dynamic head', html: '<p>Head is the sum of static lift, pressure difference and friction losses in pipes and fittings at the actual flow. Read it from the system curve or from measured suction and discharge pressures. Using the pump’s nameplate head instead of the operating head is the most common source of error.</p>' }
    ],
    mistakes: ['Using nameplate head instead of the head at the operating flow.', 'Forgetting density for slurries or brines, which can raise power markedly.', 'Sizing the motor exactly to shaft power at the duty point without margin for the end of the curve.'],
    applications: ['Motor sizing for new pumping duties.', 'Energy audits of pumping systems.', 'Checking measured motor power against the expected duty point.'],
    faq: [{ q: 'Why multiply by 9.80665?', a: 'Hydraulic power is the energy needed to lift the fluid mass per second: density × g × flow × head. g is standard gravity in m/s².' }],
    related: ['affinity-laws', 'energy-cost', 'motor-efficiency-savings', 'electrical-power']
  },
  {
    id: 'affinity-laws', category: 'energy', title: 'Fan & Pump Affinity Laws Calculator',
    seoTitle: 'Affinity Laws Calculator – VSD Energy Savings',
    description: 'Estimate power, flow and pressure at a new speed using the fan and pump affinity laws, and the theoretical energy savings from a variable speed drive.',
    intro: 'For centrifugal fans and pumps, flow changes with speed, pressure with speed squared and power with speed cubed. A small speed reduction therefore gives a large power reduction. This calculator applies these affinity laws to estimate the savings from a variable speed drive (VSD).',
    formulas: ['Flow₂ / Flow₁ = N₂ / N₁', 'Head₂ / Head₁ = (N₂ / N₁)²', 'Power₂ / Power₁ = (N₂ / N₁)³'],
    vars: [['N₁, N₂', 'Current and new rotational speed', 'rpm or %'], ['Power₁', 'Measured absorbed power at current speed', 'kW']],
    exampleContext: 'A 55 kW cooling-tower fan is slowed to 80% speed for 5,000 hours a year. Energy costs 0.12 per kWh.',
    sections: [
      { h: 'Why real savings are lower', html: '<p>The cube law holds for systems where pressure is entirely friction (the system curve passes through zero). Most pumping systems have static head; most ventilation systems have some fixed pressure. Then the operating point moves along the system curve rather than the ideal parabola, and savings are smaller. VSD and motor losses at reduced speed also reduce the net gain. Treat the result as an upper bound and confirm with measured power.</p>' },
      { h: 'Where VSDs pay best', html: '<p>The best candidates run long hours at partial flow controlled today by throttling valves, dampers or recirculation. Fixed-flow duties at full speed gain nothing.</p>' }
    ],
    mistakes: ['Applying the cube law to positive-displacement pumps or compressors: it does not apply.', 'Ignoring static head in pumping systems.', 'Using nameplate power instead of measured absorbed power.'],
    applications: ['Screening VSD projects on fans and pumps.', 'Estimating savings from slowing over-sized fans.', 'Explaining throttling losses to non-specialists.'],
    faq: [{ q: 'Does the cube law apply to conveyors?', a: 'No. Belt conveyor power depends mainly on load and friction, roughly in proportion to speed and throughput, not to the cube of speed.' }],
    related: ['pump-power', 'motor-efficiency-savings', 'energy-cost', 'payback-period']
  },
  {
    id: 'compressed-air-leak-cost', category: 'energy', title: 'Compressed Air Leak Cost Calculator',
    seoTitle: 'Compressed Air Leak Cost Calculator – Load/Unload Test',
    description: 'Estimate the share of compressor capacity lost to air leaks, the wasted kWh and the annual energy cost, using the load/unload test with a worked example.',
    intro: 'Leaks often consume a significant share of a compressor’s output, and the energy is paid every hour the system is pressurised. The load/unload test is a simple way to measure leakage: with all production demand off, the time the compressor spends loaded reflects only the leaks.',
    formulas: ['Leakage = Load time ÷ (Load time + Unload time)', 'Energy lost = Compressor power × Leakage × Pressurised hours', 'Cost = Energy lost × Energy price'],
    vars: [['Load / unload time', 'Average durations over several cycles, with no production demand', 's'], ['Compressor power', 'Electrical input power at full load', 'kW']],
    exampleContext: 'During a weekend shutdown a 75 kW compressor loads for 18 seconds and unloads for 42 seconds per cycle. The network stays pressurised 8,000 hours a year.',
    sections: [
      { h: 'Running the test', html: '<ol><li>Stop all production air use (shutdown, weekend), but keep the network pressurised.</li><li>Time at least five load/unload cycles and average them.</li><li>For variable-speed compressors, record average power instead and compare with full-load power.</li></ol><p>A sequence of tags, repairs and re-tests turns the result into a tracked improvement project.</p>' }
    ],
    mistakes: ['Testing with production still drawing air.', 'Timing a single cycle instead of an average.', 'Ignoring unloaded running power, which is a separate waste in load/unload compressors.'],
    applications: ['Leak-management programmes and energy audits.', 'Justifying ultrasonic leak detection.', 'Setting a baseline before and after repair campaigns.'],
    faq: [{ q: 'What leakage level is acceptable?', a: 'There is no universal figure. Track your own baseline and the trend after repair campaigns; any reduction is directly saved energy.' }],
    related: ['energy-cost', 'specific-energy-consumption', 'payback-period', 'co2-emissions']
  },
  {
    id: 'co2-emissions', category: 'energy', title: 'Electricity CO₂ Emissions Calculator',
    seoTitle: 'Electricity CO2 Emissions Calculator – Scope 2 (kg CO2e)',
    description: 'Convert electricity consumption into CO₂-equivalent emissions with your grid emission factor, and calculate emission intensity per tonne or unit of output.',
    intro: 'Scope 2 emissions from purchased electricity equal the energy consumed multiplied by an emission factor. The factor depends on the country, the year and the reporting method, so this calculator asks for it instead of assuming one.',
    formulas: ['Emissions (kg CO₂e) = Electricity (kWh) × Emission factor (kg CO₂e/kWh)', 'Intensity = Emissions ÷ Production output'],
    vars: [['Emission factor', 'Grid factor for the location and year (location-based method)', 'kg CO₂e/kWh'], ['Output', 'Production in the same period and boundary', 't or units']],
    exampleContext: 'A conveyor drive used 306,383 kWh in a year. The illustrative grid factor is 0.45 kg CO₂e/kWh (replace it with your official factor), and the system moved 920,000 tonnes.',
    sections: [
      { h: 'Choosing the emission factor', html: '<p>Use the factor published by your national authority, grid operator or utility for the reporting year. The GHG Protocol distinguishes the <em>location-based</em> method (average grid factor) from the <em>market-based</em> method (contractual instruments such as green tariffs). Report which method and factor you used. The example value on this page is illustrative only.</p>' },
      { h: 'Linking energy and emissions', html: '<p>Every kWh saved with the <a href="/calculators/motor-efficiency-savings">motor efficiency</a>, <a href="/calculators/affinity-laws">VSD</a> or <a href="/calculators/compressed-air-leak-cost">compressed air</a> calculators can be converted here into avoided emissions.</p>' }
    ],
    mistakes: ['Using a factor from another country or year.', 'Mixing location-based and market-based figures in one report.', 'Dividing by output from a different boundary than the energy meter.'],
    applications: ['Scope 2 reporting for a site or line.', 'Expressing energy projects in avoided CO₂e.', 'Emission intensity indicators per tonne produced.'],
    faq: [{ q: 'Does this include Scope 1 emissions?', a: 'No. Fuels burned on site (boilers, vehicles) are Scope 1 and use fuel-specific factors.' }],
    related: ['energy-cost', 'specific-energy-consumption', 'motor-efficiency-savings', 'compressed-air-leak-cost']
  },
  {
    id: 'npv', category: 'finance', title: 'NPV & IRR Calculator',
    seoTitle: 'NPV & IRR Calculator – Net Present Value, Discounted Payback',
    description: 'Calculate net present value, internal rate of return, profitability index and discounted payback for a project with equal annual cash flows.',
    intro: 'Net present value converts future cash flows into today’s money using a discount rate, then subtracts the investment. A positive NPV means the project earns more than the required return. This calculator handles the common case of equal annual cash flows over the project life, with an optional salvage value.',
    formulas: ['NPV = −I + Σ CF ÷ (1 + r)ᵗ + S ÷ (1 + r)ⁿ', 'IRR = the rate r at which NPV = 0', 'Profitability index = PV of inflows ÷ I'],
    vars: [['I', 'Initial investment', 'currency'], ['CF', 'Annual net cash inflow', 'currency/year'], ['r', 'Discount rate', '% per year'], ['n', 'Project life', 'years'], ['S', 'Salvage value at the end of life', 'currency']],
    exampleContext: 'A variable-speed drive retrofit costs 85,000, saves 31,000 a year for 8 years and has a residual value of 5,000. The company uses a 10% discount rate.',
    sections: [
      { h: 'NPV, IRR and payback together', html: '<p>Payback tells you how fast money returns, IRR the return rate, NPV the value created. They can disagree: a short project with a high IRR may create less value than a longer one with a lower IRR. For mutually exclusive choices, rank by NPV at the company’s discount rate. Use the <a href="/calculators/payback-period">payback calculator</a> as a first screen.</p>' },
      { h: 'Choosing the discount rate', html: '<p>Use your organisation’s hurdle rate or weighted average cost of capital, adjusted for project risk. Your finance team normally sets it.</p>' }
    ],
    mistakes: ['Discounting savings that are not cash (allocated overheads that do not change).', 'Using a discount rate that ignores project risk.', 'Comparing IRRs of projects of very different size or duration.'],
    applications: ['Capital requests for maintenance and energy projects.', 'Comparing repair-versus-replace options.', 'Lease, buy or retrofit decisions.'],
    faq: [{ q: 'What if cash flows differ each year?', a: 'This version assumes equal annual flows. For uneven flows, discount each year separately in a spreadsheet; the method is the same.' }],
    related: ['payback-period', 'roi', 'break-even', 'motor-efficiency-savings']
  },
  {
    id: 'inventory-carrying-cost', category: 'inventory', title: 'Inventory Carrying Cost Calculator',
    seoTitle: 'Inventory Carrying Cost Calculator – Holding Cost Rate',
    description: 'Calculate the annual cost of holding inventory from capital, storage, insurance and obsolescence rates, and get the carrying cost rate for EOQ.',
    intro: 'Inventory costs money every day it sits on the shelf: capital tied up, warehouse space, insurance and the risk of damage or obsolescence. This calculator turns those components into an annual carrying cost and a single carrying cost rate.',
    formulas: ['Carrying cost rate = Capital % + Storage % + Insurance % + Risk %', 'Annual carrying cost = Average inventory value × Carrying cost rate'],
    vars: [['Average inventory value', 'Inventory at cost, averaged over the year', 'currency'], ['Rates', 'Annual cost of each component as a share of inventory value', '% per year']],
    exampleContext: 'A plant holds 400,000 of inventory on average. Capital costs 10% a year, storage and handling 6%, insurance 2% and obsolescence and shrinkage 5%.',
    sections: [
      { h: 'Where the rates come from', html: '<ul><li><strong>Capital:</strong> your cost of capital or the return you could earn elsewhere.</li><li><strong>Storage and handling:</strong> warehouse cost (rent or depreciation, energy, staff) divided by average inventory value.</li><li><strong>Risk:</strong> write-offs, damage and shrinkage from the last few years, divided by average inventory.</li></ul><p>The rate feeds the <a href="/calculators/eoq">EOQ calculator</a>: holding cost per unit = unit cost × rate.</p>' }
    ],
    mistakes: ['Counting storage costs that would not change if inventory fell.', 'Using an optimistic obsolescence rate for spares or seasonal goods.', 'Applying one rate to items with very different risk profiles.'],
    applications: ['Inventory reduction business cases.', 'EOQ and safety stock settings.', 'Comparing in-house stock with consignment or vendor-managed inventory.'],
    faq: [{ q: 'Is the carrying cost rate the same as the interest rate?', a: 'No. Interest or capital cost is only one component; storage, insurance and risk are added to it.' }],
    related: ['eoq', 'inventory-turnover', 'safety-stock', 'reorder-point']
  },
  {
    id: 'unit-cost', category: 'finance', title: 'Cost per Unit Calculator',
    seoTitle: 'Cost per Unit Calculator – Materials, Labor & Overhead',
    description: 'Calculate the cost per unit from materials, direct labor and overhead for a batch or period, with an optional margin check against selling price.',
    intro: 'Cost per unit is the total production cost of a batch or period divided by the good units produced. Splitting it into materials, labor and overhead shows which cost drives the price and where improvement pays.',
    formulas: ['Total cost = Materials + Direct labor + Overhead', 'Cost per unit = Total cost ÷ Good units', 'Margin per unit = Price − Cost per unit'],
    vars: [['Materials', 'Raw materials and components consumed', 'currency'], ['Direct labor', 'Wages and charges of production staff for the batch or period', 'currency'], ['Overhead', 'Indirect costs allocated: energy, maintenance, depreciation, supervision', 'currency'], ['Good units', 'Units meeting specification', 'units']],
    exampleContext: 'A batch of 2,500 good units used 18,000 of materials, 9,600 of direct labor and 7,400 of allocated overhead. The selling price is 17.50.',
    sections: [
      { h: 'Using the breakdown', html: '<p>If materials dominate, yield and purchasing matter most; scrap is expensive. If labor dominates, cycle time and line balance matter (see the <a href="/calculators/labor-productivity">labor productivity calculator</a>). If overhead dominates, volume and asset utilisation matter, because fixed costs spread over more units.</p>' }
    ],
    mistakes: ['Dividing by total units instead of good units.', 'Allocating overhead on a basis unrelated to what drives it.', 'Using full cost per unit for short-term pricing decisions where only variable costs change (see break-even).'],
    applications: ['Product costing and pricing.', 'Make-or-buy comparisons.', 'Quantifying the cost of scrap and rework.'],
    faq: [{ q: 'Should depreciation be included?', a: 'For full product cost, yes, as part of overhead. For short-term decisions, use the contribution margin approach in the break-even calculator.' }],
    related: ['break-even', 'first-pass-yield', 'labor-productivity', 'npv']
  }
];

// Structured "Common mistakes" (for pages that had no such section) and "Where it's used" for every page.
export const mistakes = {
  'cycle-time': ['Including breaks or changeovers in run time.', 'Comparing average cycle time with ideal cycle time as if they measured the same thing.', 'Timing too few cycles to see variation.'],
  'production-rate': ['Mixing scheduled time and run time between periods.', 'Counting total output in one report and good output in another.', 'Comparing rates across products with different work content.'],
  'capacity-utilization': ['Comparing figures from different periods or units.', 'Using an outdated design capacity.', 'Chasing 100% utilisation on non-bottleneck equipment.'],
  'littles-law': ['Measuring WIP and throughput at different process boundaries.', 'Applying it to a system that is filling up or emptying.', 'Using daily throughput with WIP counted in a different unit.'],
  'first-pass-yield': ['Counting reworked units as first-pass good.', 'Measuring at the end of the line only, which hides internal rework loops.', 'Mixing units started and units finished from different periods.'],
  'dpmo': ['Inflating opportunities per unit to lower DPMO.', 'Quoting sigma level without saying whether the 1.5σ shift is included.', 'Using too small a sample to estimate rare defects.'],
  'mtbf': ['Using calendar time when operating time is meant.', 'Counting minor stops or preventive work as failures.', 'Reading MTBF as the expected life of one component.'],
  'mttr': ['Starting the clock when the technician arrives instead of when the equipment stopped.', 'Mixing preventive and corrective work.', 'Reporting only the mean when a few long repairs dominate.'],
  'availability': ['Mixing inherent, achieved and operational availability in one comparison.', 'Excluding waiting for parts from downtime.', 'Averaging availability of equipment in series instead of multiplying.'],
  'downtime-cost': ['Applying lost margin to stops that can be recovered.', 'Using selling price instead of contribution margin.', 'Forgetting overtime needed to catch up.'],
  'energy-cost': ['Using nameplate power for motors that run part-loaded.', 'Ignoring demand and reactive-energy charges.', 'Mixing kW (power) and kWh (energy).'],
  'specific-energy-consumption': ['Different boundaries for energy and output.', 'Reading a rise in SEC at low output as worse performance.', 'Comparing sites with different product mixes.'],
  'electrical-power': ['Using phase voltage in the three-phase formula.', 'Estimating load from current alone at light load.', 'Ignoring harmonics with variable-speed drives.'],
  'power-factor-correction': ['Sizing capacitors for unity at full load and over-correcting at light load.', 'Installing standard capacitors on networks with strong harmonics.', 'Using peak instead of typical active power.'],
  'motor-efficiency-savings': ['Using nameplate efficiency at a very different load point.', 'Counting the full motor price when replacing at failure.', 'Upgrading the motor while the driven system wastes more energy.'],
  'reorder-point': ['Comparing the reorder point with on-hand stock instead of inventory position.', 'Using an outdated demand rate.', 'Omitting the review period in periodic-review systems.'],
  'safety-stock': ['Using the standard deviation of monthly demand with lead time in days.', 'Confusing cycle service level with fill rate.', 'Applying the normal model to intermittent demand.'],
  'eoq': ['Including purchase price changes in the holding cost.', 'Using a cost per order that includes fixed costs that do not vary with order count.', 'Ignoring quantity discounts.'],
  'inventory-turnover': ['Using sales instead of cost of goods sold.', 'Using year-end inventory only in a seasonal business.', 'Comparing turnover across unrelated industries.'],
  'belt-conveyor-capacity': ['Using full-trough area without the inclination factor.', 'Using solid density instead of loose bulk density.', 'Assuming design capacity at all feed conditions.'],
  'roi': ['Using gross benefits as net gain.', 'Ignoring implementation and running costs.', 'Comparing projects of different lengths without annualising.'],
  'payback-period': ['Using profit instead of cash flow.', 'Ignoring cash flows after payback.', 'Applying the same payback threshold to all risk levels.'],
  'break-even': ['Treating semi-variable costs as fully fixed.', 'Using list price instead of net realised price.', 'Ignoring capacity limits above the break-even volume.'],
  'working-hours': ['Writing 7 h 45 min as 7.45 instead of 7.75 hours.', 'Forgetting overnight shifts that end the next day.', 'Deducting paid breaks for payroll.'],
  'labor-productivity': ['Leaving overtime hours out.', 'Comparing periods with different product mixes.', 'Counting rejected output.']
};

export const applications = {
  'oee': ['Daily and shift performance reviews on critical equipment.', 'Ranking loss categories for TPM and kaizen activities.', 'Before/after evaluation of SMED or reliability projects.'],
  'takt-time': ['Line balancing and staffing.', 'Designing new cells and flow lines.', 'Re-planning after changes in demand.'],
  'cycle-time': ['Time studies and line balancing.', 'Checking a station against takt time.', 'Estimating output for planning.'],
  'production-rate': ['Shift reports and daily production meetings.', 'Estimating hours to complete an order.', 'Validating standard rates.'],
  'capacity-utilization': ['Capacity planning and investment cases.', 'S&OP discussions on available capacity.', 'Separating planning losses from operating losses.'],
  'littles-law': ['Value stream mapping.', 'Setting WIP limits in pull systems.', 'Lead-time reduction projects.'],
  'first-pass-yield': ['Quality KPIs per process step.', 'Prioritising rework reduction.', 'Feeding the quality factor of OEE.'],
  'dpmo': ['Six Sigma project baselines.', 'Comparing defect performance across products of different complexity.', 'Supplier quality reviews.'],
  'mtbf': ['Reliability KPIs for critical equipment.', 'Spare parts and maintenance planning.', 'Comparing equipment generations or suppliers.'],
  'mttr': ['Maintenance performance reviews.', 'Spare parts strategy and repair standardisation.', 'Availability targets in service contracts.'],
  'availability': ['Maintenance target setting.', 'Redundancy and buffer decisions in linked systems.', 'Contractual availability guarantees.'],
  'downtime-cost': ['Prioritising reliability projects.', 'Justifying critical spares and redundancy.', 'Explaining the value of maintenance to management.'],
  'energy-cost': ['Budgeting energy for equipment.', 'Comparing operating scenarios (hours, load).', 'First-pass screening of energy projects.'],
  'specific-energy-consumption': ['Energy performance indicators (EnPIs) for an ISO 50001 energy management system.', 'Monthly energy reviews.', 'Benchmarking lines or periods with similar mix.'],
  'electrical-power': ['Checking motor load from clamp-meter readings.', 'Sizing cables and protection.', 'Preparing power-factor studies.'],
  'power-factor-correction': ['Avoiding reactive-energy penalties.', 'Releasing transformer capacity.', 'Specifying capacitor banks.'],
  'motor-efficiency-savings': ['Repair-or-replace decisions at motor failure.', 'Energy efficiency programmes.', 'Specifying IE classes in purchasing.'],
  'belt-conveyor-capacity': ['Checking capacity before increasing throughput.', 'Belt speed changes.', 'Diagnosing spillage and overfilling.'],
  'reorder-point': ['Setting min/max levels in an ERP or CMMS.', 'Spare parts replenishment.', 'Supplier lead-time negotiations.'],
  'safety-stock': ['Inventory policy by ABC class.', 'Service-level versus stock trade-offs.', 'Supplier variability reviews.'],
  'eoq': ['Purchasing lot sizes.', 'Production batch sizing.', 'Showing the value of setup reduction.'],
  'inventory-turnover': ['Working capital reviews.', 'Identifying slow-moving stock.', 'Supply chain KPIs.'],
  'roi': ['Project screening.', 'Post-implementation reviews.', 'Comparing improvement ideas.'],
  'payback-period': ['First screening of improvement projects.', 'Capital request forms.', 'Energy efficiency investments.'],
  'break-even': ['Pricing decisions.', 'New product or new line evaluations.', 'Margin of safety analysis.'],
  'working-hours': ['Timesheets and payroll checks.', 'Shift planning.', 'Available time for takt calculations.'],
  'labor-productivity': ['Workforce planning.', 'Continuous improvement KPIs.', 'Benchmarking teams with similar products.']
};

export const categoryPages = {
  production: {
    h1: 'Production & Lean calculators',
    seoTitle: 'Production & Lean Calculators – OEE, Takt, Cycle Time',
    description: 'Free production and lean calculators: OEE, TEEP, takt time, cycle time, production rate, capacity utilization and lead time with Little’s Law.',
    intro: '<p>These calculators measure how well production time is used and how work flows. Start with <a href="/calculators/oee">OEE</a> to see availability, performance and quality losses in planned time, and <a href="/calculators/teep">TEEP</a> to see capacity left in the calendar. <a href="/calculators/takt-time">Takt time</a> and <a href="/calculators/cycle-time">cycle time</a> tell you whether a line can keep pace with demand, and <a href="/calculators/littles-law">Little’s Law</a> links work in process to lead time.</p>',
    guide: '<h2>Which calculator do I need?</h2><ul><li><strong>Is the equipment performing?</strong> OEE, then TEEP for the whole calendar.</li><li><strong>Can we meet demand?</strong> Takt time against bottleneck cycle time.</li><li><strong>Why is lead time long?</strong> Little’s Law: lead time grows with WIP.</li><li><strong>How busy is the plant?</strong> Capacity utilization and efficiency.</li></ul>'
  },
  quality: {
    h1: 'Quality calculators',
    seoTitle: 'Quality Calculators – First Pass Yield, DPMO, Sigma Level',
    description: 'Free quality calculators for first pass yield, scrap and rework rate, DPMO and sigma level, with formulas and worked examples.',
    intro: '<p>Quality losses cost twice: once in material and once in the capacity used to make or repair a bad part. <a href="/calculators/first-pass-yield">First pass yield</a> shows how much output is right the first time, and <a href="/calculators/dpmo">DPMO and sigma level</a> normalise defect rates so different products can be compared.</p>',
    guide: '<h2>Which calculator do I need?</h2><ul><li><strong>How much do we rework or scrap?</strong> First pass yield.</li><li><strong>How capable is the process?</strong> DPMO and sigma level.</li><li><strong>What does a defect cost?</strong> Combine scrap with the <a href="/calculators/unit-cost">cost per unit</a> calculator.</li></ul>'
  },
  maintenance: {
    h1: 'Maintenance & reliability calculators',
    seoTitle: 'Maintenance Calculators – MTBF, MTTR, Downtime Cost',
    description: 'Free maintenance and reliability calculators: MTBF, MTTR, equipment availability and the cost of unplanned downtime.',
    intro: '<p>Reliability work starts with three numbers: how often equipment fails (<a href="/calculators/mtbf">MTBF</a>), how long it takes to restore it (<a href="/calculators/mttr">MTTR</a>) and the resulting <a href="/calculators/availability">availability</a>. The <a href="/calculators/downtime-cost">downtime cost calculator</a> turns stops into money, which is what most improvement decisions need.</p>',
    guide: '<h2>Which calculator do I need?</h2><ul><li><strong>Are failures getting more frequent?</strong> MTBF over successive periods.</li><li><strong>Are repairs too slow?</strong> MTTR, broken down into response, diagnosis and repair.</li><li><strong>What availability can we promise?</strong> Availability from MTBF and MTTR.</li><li><strong>Is a spare or an upgrade worth it?</strong> Downtime cost, then payback or NPV.</li></ul>'
  },
  energy: {
    h1: 'Energy & electrical calculators',
    seoTitle: 'Energy Calculators – kWh Cost, Motors, Pumps, Power Factor',
    description: 'Free energy and electrical calculators: energy cost, specific energy consumption, motor and pump power, VSD savings, compressed air leaks, power factor and CO₂.',
    intro: '<p>Motors, pumps, fans and compressed air account for a large part of industrial electricity use. These tools estimate energy cost and savings, size electrical loads and convert results into emissions. They follow the logic of an energy review: measure the use, find the significant users, then quantify improvement options.</p>',
    guide: '<h2>Which calculator do I need?</h2><ul><li><strong>What does this machine cost to run?</strong> <a href="/calculators/energy-cost">Energy cost</a>.</li><li><strong>Is energy performance improving?</strong> <a href="/calculators/specific-energy-consumption">Specific energy consumption</a>.</li><li><strong>Pumps and fans?</strong> <a href="/calculators/pump-power">Pump power</a> and <a href="/calculators/affinity-laws">affinity laws</a>.</li><li><strong>Compressed air?</strong> <a href="/calculators/compressed-air-leak-cost">Leak cost</a>.</li><li><strong>Electrical checks?</strong> <a href="/calculators/electrical-power">kW, kVA, kvar</a> and <a href="/calculators/power-factor-correction">power factor correction</a>.</li><li><strong>Emissions?</strong> <a href="/calculators/co2-emissions">CO₂ from electricity</a>.</li></ul>'
  },
  inventory: {
    h1: 'Inventory & logistics calculators',
    seoTitle: 'Inventory Calculators – Reorder Point, Safety Stock, EOQ',
    description: 'Free inventory and logistics calculators: reorder point, safety stock, EOQ, carrying cost, inventory turnover and belt conveyor capacity.',
    intro: '<p>Inventory decisions balance service against cost. The <a href="/calculators/reorder-point">reorder point</a> and <a href="/calculators/safety-stock">safety stock</a> calculators decide when to order, <a href="/calculators/eoq">EOQ</a> how much, and the <a href="/calculators/inventory-carrying-cost">carrying cost</a> and <a href="/calculators/inventory-turnover">turnover</a> calculators what holding stock costs. For bulk material handling, the <a href="/calculators/belt-conveyor-capacity">belt conveyor capacity</a> calculator converts belt geometry and speed into tonnes per hour.</p>',
    guide: '<h2>Which calculator do I need?</h2><ul><li><strong>When should I reorder?</strong> Reorder point with safety stock.</li><li><strong>How much should I order?</strong> EOQ, using the carrying cost rate.</li><li><strong>Is stock too high?</strong> Turnover and days of inventory.</li><li><strong>Can the conveyor carry more?</strong> Belt conveyor capacity.</li></ul>'
  },
  finance: {
    h1: 'Business finance calculators',
    seoTitle: 'Business Finance Calculators – NPV, IRR, ROI, Payback',
    description: 'Free business finance calculators for operations projects: NPV and IRR, ROI, payback period, break-even and cost per unit.',
    intro: '<p>Operations improvements compete for budget with everything else. These calculators express a project or a product in the terms finance teams use: <a href="/calculators/payback-period">payback</a> for a first screen, <a href="/calculators/npv">NPV and IRR</a> for value, <a href="/calculators/roi">ROI</a> for comparison, <a href="/calculators/break-even">break-even</a> and <a href="/calculators/unit-cost">cost per unit</a> for products.</p>',
    guide: '<h2>Which calculator do I need?</h2><ul><li><strong>Is the project worth it?</strong> NPV at your discount rate, with IRR and discounted payback.</li><li><strong>How fast does it pay back?</strong> Payback period.</li><li><strong>How many units to cover fixed costs?</strong> Break-even.</li><li><strong>What does one unit cost?</strong> Cost per unit.</li></ul>'
  },
  workforce: {
    h1: 'Time & workforce calculators',
    seoTitle: 'Workforce Calculators – Working Hours, Labor Productivity',
    description: 'Free time and workforce calculators: net working hours with overnight shifts and labor productivity per labor hour.',
    intro: '<p>Time is the base unit of most operations measures. The <a href="/calculators/working-hours">working hours calculator</a> converts shift times into decimal hours for payroll and planning, and the <a href="/calculators/labor-productivity">labor productivity calculator</a> relates output to hours worked.</p>',
    guide: '<h2>Which calculator do I need?</h2><ul><li><strong>How many hours did a shift last?</strong> Working hours, including night shifts.</li><li><strong>Is the team more productive?</strong> Labor productivity against a baseline.</li><li><strong>How much time is available to produce?</strong> Feed net hours into <a href="/calculators/takt-time">takt time</a>.</li></ul><h2>Good practice for time data</h2><p>Hours are the denominator of most productivity and cost measures, so small recording errors spread everywhere. Record clock times rather than rounded durations, keep paid and unpaid breaks separate, and state which hours are counted (direct labour only, or all staff). When comparing teams or periods, use the same definition each time and note changes in product mix, because a shift to simpler products raises output per hour without any real improvement.</p>'
  }
};

// Curated "start here" tools: chosen for breadth across categories, not from usage data (none yet).
export const featured = ['oee', 'mtbf', 'energy-cost', 'safety-stock', 'npv', 'takt-time'];
