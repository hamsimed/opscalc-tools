// Build-time content for calculator pages. Math lives in assets/js/calc-core.js.
// Rule: no invented statistics, benchmarks are labelled as conventions, not facts.

export const categories = [
  { id: 'production', name: 'Production & Lean', blurb: 'Measure equipment effectiveness, line pace and flow.' },
  { id: 'quality', name: 'Quality', blurb: 'Quantify yield, scrap and defect performance.' },
  { id: 'maintenance', name: 'Maintenance & Reliability', blurb: 'Track failure behaviour, repair speed and the cost of stops.' },
  { id: 'energy', name: 'Energy & Electrical', blurb: 'Estimate energy cost, efficiency gains and electrical loads.' },
  { id: 'inventory', name: 'Inventory & Logistics', blurb: 'Size stock levels, order quantities and material flow.' },
  { id: 'finance', name: 'Business Finance', blurb: 'Evaluate investments and cost structures.' },
  { id: 'workforce', name: 'Time & Workforce', blurb: 'Calculate hours worked and labour productivity.' }
];

export const pages = [
  // ---------------- PRODUCTION ----------------
  {
    id: 'oee', category: 'production', title: 'OEE Calculator',
    seoTitle: 'OEE Calculator – Availability, Performance, Quality',
    description: 'Calculate Overall Equipment Effectiveness (OEE) from shop-floor time and count data or from A, P and Q percentages. Shows the biggest loss factor.',
    intro: 'Overall Equipment Effectiveness (OEE) shows how much of your planned production time actually produces good parts at full speed. Enter raw shift data (times and counts) or the three factors if you already have them. The calculator also tells you which factor is losing the most.',
    formulas: [
      'Availability = Run time ÷ Planned production time',
      'Run time = Planned production time − Unplanned stop time',
      'Performance = (Ideal cycle time × Total units) ÷ Run time',
      'Quality = Good units ÷ Total units',
      'OEE = Availability × Performance × Quality'
    ],
    vars: [['Planned production time', 'Shift time minus planned stops (breaks, planned maintenance, no-demand time)', 'min'], ['Unplanned stop time', 'Breakdowns, changeovers, material shortages, minor stops logged as downtime', 'min'], ['Ideal cycle time', 'Fastest sustainable cycle for the product, from design rate or demonstrated best', 's/unit'], ['Good units', 'Units meeting specification the first time, without rework', 'units']],
    exampleContext: 'A packaging line runs one 8-hour shift (480 planned minutes). It loses 47 minutes to stops, produces 19,271 units against a 1-second ideal cycle, and 18,848 of them are right first time.',
    sections: [
      { h: 'How to read your OEE', html: '<p>OEE puts three separate losses into one percentage. The single number is good for trends. For action, the factors matter more. A 65% OEE with 97% quality and 74% performance needs a different response from one with 75% availability.</p><p>Many references quote 85% as "world-class" OEE (from Seiichi Nakajima’s TPM work). Treat it as a convention, not a target. Achievable OEE depends on product mix, changeover frequency and how strictly you define planned time. Comparing a line with its own history is usually more useful than comparing it with another plant.</p>' },
      { h: 'Common mistakes', html: '<ul><li><strong>Inflated ideal cycle time.</strong> Using the average or standard cycle instead of the true best cycle pushes performance toward or above 100% and hides speed losses.</li><li><strong>Moving losses into "planned" time.</strong> Classifying changeovers or waiting time as planned stops raises availability on paper but hides the loss you most need to see.</li><li><strong>Counting reworked parts as good.</strong> Quality should use right-first-time units. Reworked parts consumed capacity twice.</li><li><strong>Averaging OEE percentages across machines.</strong> Weight by planned time, or recompute from summed times and counts.</li></ul>' },
      { h: 'Standards and definitions', html: '<p>ISO 22400-2 defines OEE as a key performance indicator for manufacturing operations management, using the same availability × effectiveness × quality structure. Write down your plant’s definitions (what counts as planned time, which stops are minor stops) and apply them the same way every shift, so trends stay meaningful.</p>' }
    ],
    faq: [
      { q: 'What is the difference between OEE and TEEP?', a: 'OEE measures losses against planned production time. TEEP (Total Effective Equipment Performance) measures against all calendar time, so it also shows the capacity left unused by not running nights, weekends or holidays.' },
      { q: 'Can OEE be above 100%?', a: 'No. If your calculation gives more than 100%, the ideal cycle time is usually set too slow, or counts and times come from different periods.' },
      { q: 'Should minor stops count as availability or performance loss?', a: 'Either can work if you are consistent. A common practice is to log stops above a threshold (for example 5 minutes) as downtime and let shorter stops show up as performance loss.' }
    ],
    related: ['availability', 'takt-time', 'first-pass-yield', 'downtime-cost', 'cycle-time']
  },
  {
    id: 'takt-time', category: 'production', title: 'Takt Time Calculator',
    seoTitle: 'Takt Time Calculator – Pace of Production to Demand',
    description: 'Calculate takt time from shift length, breaks, shifts per day and customer demand, and check whether your bottleneck cycle time can keep up.',
    intro: 'Takt time is the pace at which you must complete one unit to meet customer demand exactly. It comes from demand and available time, not from machine capability. Enter your shift pattern and daily demand, and optionally your bottleneck cycle time, to see whether the line can keep up.',
    formulas: ['Available time = (Shift length − Planned breaks) × Shifts per day', 'Takt time = Available time ÷ Customer demand', 'Bottleneck load = Bottleneck cycle time ÷ Takt time'],
    vars: [['Shift length', 'Paid or scheduled duration of one shift', 'min'], ['Planned breaks', 'Breaks, team meetings, planned cleaning when the line is not expected to run', 'min'], ['Customer demand', 'Units the customer requires per day, after levelling', 'units/day'], ['Bottleneck cycle time', 'Cycle time of the slowest station', 's/unit']],
    exampleContext: 'An assembly cell works two 8-hour shifts with 60 minutes of planned breaks per shift. Customers order 840 units per day, and the slowest station takes 55 seconds per unit.',
    sections: [
      { h: 'Interpreting takt time', html: '<p>Takt time sets the rhythm for line balancing. If any station’s cycle time is above takt, that station limits output and demand cannot be met without overtime or more capacity. If every station is well below takt, the line is over-resourced for current demand.</p><p>Do not design to 100% of takt. Real lines lose time to stops, quality issues and changeovers. Many lean practitioners plan a "planned cycle time" below takt to keep a margin for these losses. The size of that margin depends on your own availability and quality history.</p>' },
      { h: 'Takt time vs. cycle time vs. lead time', html: '<ul><li><strong>Takt time</strong>: the required pace, set by demand.</li><li><strong>Cycle time</strong>: the actual pace at which a station or line completes units.</li><li><strong>Lead time</strong>: total elapsed time for one unit to pass through the whole process, including waiting. See the <a href="/calculators/littles-law">Little’s Law calculator</a>.</li></ul>' },
      { h: 'Common mistakes', html: '<ul><li>Subtracting unplanned downtime from available time. Takt should reflect planned time; losses belong in OEE.</li><li>Using unlevelled daily orders. Takt is most useful with averaged (levelled) demand over a planning horizon.</li><li>Mixing units: keep demand and time in the same period (per day, per shift).</li></ul>' }
    ],
    faq: [
      { q: 'Does takt time change when demand changes?', a: 'Yes. Takt time is recalculated whenever demand or available time changes, typically at each planning cycle. Frequent changes are a reason to level demand.' },
      { q: 'How do I estimate the number of operators needed?', a: 'A common first estimate is total manual work content per unit divided by takt time, rounded up. Then balance the work across stations so none exceeds takt.' }
    ],
    related: ['cycle-time', 'oee', 'production-rate', 'littles-law', 'capacity-utilization']
  },
  {
    id: 'cycle-time', category: 'production', title: 'Cycle Time Calculator',
    seoTitle: 'Cycle Time Calculator – Average Time per Unit',
    description: 'Calculate average cycle time and throughput from net production time and units completed. Optionally compare it with takt time.',
    intro: 'Average cycle time is the observed time between completed units over a period. Use this calculator to turn production time and output into seconds per unit and units per hour, and to check the result against takt time.',
    formulas: ['Average cycle time = Net production time ÷ Units completed', 'Throughput = Units completed ÷ Net production time'],
    vars: [['Net production time', 'Time the process was running during the observation, excluding planned breaks', 'min'], ['Units completed', 'Units that left the process in that time', 'units'], ['Takt time', 'Required pace from demand (optional)', 's/unit']],
    exampleContext: 'A machining cell ran 420 net minutes in a shift and completed 380 parts. Takt time for this product family is 70 seconds.',
    sections: [
      { h: 'Observed vs. ideal cycle time', html: '<p>The value here is an <em>observed average</em>: it already includes minor stops and slow cycles. It differs from the <em>ideal cycle time</em> used in OEE, which is the best achievable cycle. The gap between them is the speed and minor-stop loss.</p><p>For line balancing, time individual stations with a stopwatch or machine logs and record several cycles. Averages hide variation, and variation causes queues.</p>' },
      { h: 'Using the result', html: '<ul><li>If average cycle time is above takt, the process cannot meet demand in the available time.</li><li>If it is just below takt, small disruptions will cause missed output. Check the margin against your stop history.</li><li>Throughput (units/hour) is the same information in another form. Planners and supervisors often prefer it.</li></ul>' }
    ],
    faq: [
      { q: 'Is cycle time the same as lead time?', a: 'No. Cycle time is the interval between completed units. Lead time is how long one unit takes to go through the whole process, including queues.' },
      { q: 'Should I include changeover time?', a: 'For the average cycle time of a run, include only running time. Track changeovers separately so you can reduce them with SMED.' }
    ],
    related: ['takt-time', 'production-rate', 'oee', 'littles-law']
  },
  {
    id: 'production-rate', category: 'production', title: 'Production Rate Calculator',
    seoTitle: 'Production Rate Calculator – Units per Hour vs Target',
    description: 'Calculate production rate in units per hour, compare it with a target rate and see the shortfall or surplus in units.',
    intro: 'Production rate is output divided by operating time. Add a target rate to see attainment and how many units you are short of (or above) the plan for the period.',
    formulas: ['Production rate = Units produced ÷ Operating time', 'Attainment = Production rate ÷ Target rate', 'Gap = Target rate × Operating time − Units produced'],
    vars: [['Units produced', 'Output in the period (good units, or total — state which)', 'units'], ['Operating time', 'Time the process was scheduled to run', 'h'], ['Target rate', 'Planned or standard rate', 'units/h']],
    exampleContext: 'A filling line produced 900 cases in 6.5 scheduled hours. The standard rate is 150 cases per hour.',
    sections: [
      { h: 'Making the rate meaningful', html: '<p>Define the time base before comparing rates. "Operating time" can mean scheduled time, run time or time excluding breaks. Each definition gives a different rate. For a shift report, scheduled time shows the whole loss. Run time isolates speed losses.</p><p>When attainment is below 100%, split the gap into stoppage time (availability) and running below rate (performance). The <a href="/calculators/oee">OEE calculator</a> does this split.</p>' },
      { h: 'Typical uses', html: '<ul><li>Shift and daily production reports.</li><li>Checking a new standard rate against observed performance.</li><li>Estimating the hours needed to complete an order: units required ÷ observed rate.</li></ul>' }
    ],
    faq: [{ q: 'Should I use good units or total units?', a: 'Use good units if the rate feeds customer delivery planning. Use total units if you want to measure machine speed. Label the report clearly either way.' }],
    related: ['oee', 'cycle-time', 'capacity-utilization', 'labor-productivity']
  },
  {
    id: 'capacity-utilization', category: 'production', title: 'Capacity Utilization Calculator',
    seoTitle: 'Capacity Utilization & Efficiency Calculator',
    description: 'Calculate capacity utilization (actual vs design capacity) and efficiency (actual vs effective capacity) for a plant, line or machine.',
    intro: 'Capacity utilization compares what you produced with what the asset is designed to produce. Adding effective capacity, the output achievable after planned allowances, gives efficiency, the share of realistic capacity you actually achieved.',
    formulas: ['Utilization = Actual output ÷ Design capacity', 'Efficiency = Actual output ÷ Effective capacity'],
    vars: [['Design capacity', 'Maximum output under ideal conditions for the period', 'units'], ['Effective capacity', 'Design capacity minus planned allowances: maintenance, changeovers, product mix', 'units'], ['Actual output', 'Output achieved in the same period', 'units']],
    exampleContext: 'A plant rated at 10,000 tonnes per month has an effective capacity of 8,500 tonnes after planned shutdowns, and produced 7,200 tonnes.',
    sections: [
      { h: 'Utilization vs. efficiency', html: '<p>Low utilization can mean weak demand, planned constraints or operating losses. Efficiency separates them. If efficiency is high but utilization is low, the limit is planning (allowances, scheduling, demand). If both are low, look at operating losses: breakdowns, slow running, quality.</p>' },
      { h: 'Points of caution', html: '<ul><li>Use the same period and units for all three figures.</li><li>Design capacity for mixed products depends on mix. State the reference product.</li><li>Running near 100% utilization lengthens queues and lead times sharply when demand varies.</li></ul>' }
    ],
    faq: [{ q: 'Is capacity utilization the same as OEE?', a: 'No. Utilization compares output with a capacity rating. OEE breaks down the losses within planned production time into availability, performance and quality.' }],
    related: ['oee', 'production-rate', 'takt-time', 'belt-conveyor-capacity']
  },
  {
    id: 'littles-law', category: 'production', title: 'Lead Time Calculator (Little’s Law)',
    seoTitle: 'Little’s Law Calculator – Lead Time, WIP & Throughput',
    description: 'Estimate process lead time from work in process and throughput using Little’s Law, and calculate process cycle efficiency from value-added time.',
    intro: 'Little’s Law links three flow measures: work in process, throughput and lead time. If you know how much is in the system and how fast it leaves, you know how long an item waits on average. Add value-added time to calculate process cycle efficiency, a standard lean measure of waiting.',
    formulas: ['Lead time = WIP ÷ Throughput', 'Process cycle efficiency = Value-added time ÷ Lead time'],
    vars: [['WIP', 'Average number of units in the process (queues + in operation)', 'units'], ['Throughput', 'Average completion rate', 'units/day'], ['Value-added time', 'Time spent transforming the unit in a way the customer pays for', 'min'], ['Working hours per day', 'Used to convert lead time into minutes for PCE', 'h']],
    exampleContext: 'A fabrication shop holds about 1,200 parts in process and completes 300 per day over two 8-hour shifts. Each part receives about 45 minutes of actual processing.',
    sections: [
      { h: 'Why it matters', html: '<p>Little’s Law holds for any stable system over a long enough period, whatever the arrival or service distribution. It means the fastest way to cut lead time is often to cut WIP, not to speed up machines. Releasing less work into the system shortens queues while throughput stays the same.</p><p>Low process cycle efficiency is normal in batch environments. It shows that most of the lead time is waiting. That waiting is where value-stream mapping and pull systems help.</p>' },
      { h: 'Conditions for accurate use', html: '<ul><li>Use long-run averages. The relationship holds on average, not item by item.</li><li>The system should be roughly stable: WIP neither growing nor shrinking over the period.</li><li>Measure WIP and throughput at the same process boundary.</li></ul>' }
    ],
    faq: [{ q: 'Can I solve for WIP or throughput instead?', a: 'Yes. Rearranged: WIP = Throughput × Lead time, and Throughput = WIP ÷ Lead time. This calculator solves for lead time, which is the most common use.' }],
    related: ['takt-time', 'cycle-time', 'inventory-turnover', 'capacity-utilization']
  },

  // ---------------- QUALITY ----------------
  {
    id: 'first-pass-yield', category: 'quality', title: 'First Pass Yield & Scrap Rate Calculator',
    seoTitle: 'First Pass Yield Calculator – FPY, Scrap & Rework Rate',
    description: 'Calculate first pass yield (FPY), scrap rate, rework rate and final yield from units entering a process, units passing first time and units scrapped.',
    intro: 'First pass yield is the share of units that go through a process right the first time, with no rework or scrap. Final yield counts reworked units as good, so it hides the cost of fixing them. This calculator shows both, with scrap and rework rates.',
    formulas: ['FPY = Units passing first time ÷ Units entering', 'Scrap rate = Units scrapped ÷ Units entering', 'Rework rate = (Units entering − Passed first time − Scrapped) ÷ Units entering', 'Final yield = (Units entering − Scrapped) ÷ Units entering'],
    vars: [['Units entering', 'Units started in the process step during the period', 'units'], ['Passed first time', 'Units accepted without any rework or repair', 'units'], ['Scrapped', 'Units rejected and discarded', 'units']],
    exampleContext: 'A welding station received 2,000 frames. 1,820 passed inspection directly, 60 were scrapped, and the rest were repaired and passed.',
    sections: [
      { h: 'Rolled throughput yield', html: '<p>For a multi-step process, multiply the FPY of each step to get rolled throughput yield (RTY), the probability that a unit passes every step first time. Three steps at 95% each give an RTY of about 85.7%. Small losses at each step add up quickly.</p>' },
      { h: 'Using FPY for improvement', html: '<ul><li>Rank process steps by FPY loss (Pareto) to find where rework capacity goes.</li><li>Rework uses capacity twice. A low FPY at the bottleneck costs output directly.</li><li>Feed the quality factor of OEE with right-first-time units, consistent with FPY.</li></ul>' }
    ],
    faq: [{ q: 'Is FPY the same as first time right (FTR)?', a: 'They are usually the same idea: the share of output produced correctly without rework. Some companies use FTR at order or document level and FPY at unit level.' }],
    related: ['dpmo', 'oee', 'downtime-cost', 'production-rate']
  },
  {
    id: 'dpmo', category: 'quality', title: 'DPMO & Sigma Level Calculator',
    seoTitle: 'DPMO Calculator – Defects per Million & Sigma Level',
    description: 'Calculate DPMO, defects per unit (DPU), process yield and short-term sigma level from defects, units and opportunities per unit.',
    intro: 'Defects per million opportunities (DPMO) normalises defect counts so that simple and complex products can be compared. The calculator converts DPMO into process yield and the Six Sigma "sigma level", using the conventional 1.5-sigma shift.',
    formulas: ['DPO = Defects ÷ (Units × Opportunities per unit)', 'DPMO = DPO × 1,000,000', 'DPU = Defects ÷ Units', 'Sigma level = Φ⁻¹(1 − DPO) + 1.5'],
    vars: [['Defects', 'Total nonconformities found (one unit can have several)', 'count'], ['Units', 'Units inspected', 'count'], ['Opportunities per unit', 'Distinct, independently checkable ways a unit can be defective', 'count'], ['Φ⁻¹', 'Inverse of the standard normal cumulative distribution', '—']],
    exampleContext: 'An electronics line inspected 1,500 boards with 8 critical-to-quality characteristics each and found 34 defects.',
    sections: [
      { h: 'Defining opportunities carefully', html: '<p>DPMO is very sensitive to how opportunities are counted. Adding trivial "opportunities" lowers DPMO without any real improvement. Count only characteristics that are critical to the customer and actually checked. Then keep the definition fixed over time.</p>' },
      { h: 'About the 1.5σ shift', html: '<p>Six Sigma tables add 1.5 to the z-value to allow for long-term process drift. That is why 3.4 DPMO is called "six sigma". The shift is a convention, not a measured property of your process. If you quote a sigma level, say whether it includes the shift.</p>' }
    ],
    faq: [{ q: 'What DPMO corresponds to six sigma?', a: 'By convention, 3.4 DPMO is six sigma with the 1.5σ shift included. Without the shift, 3.4 DPMO corresponds to about 4.5σ.' }, { q: 'Why does the calculator not show sigma when there are no defects?', a: 'With zero observed defects, the sample cannot estimate a sigma level. You can only say the true defect rate is probably below a bound that depends on sample size.' }],
    related: ['first-pass-yield', 'oee']
  },

  // ---------------- MAINTENANCE ----------------
  {
    id: 'mtbf', category: 'maintenance', title: 'MTBF Calculator',
    seoTitle: 'MTBF Calculator – Mean Time Between Failures',
    description: 'Calculate mean time between failures (MTBF), failure rate and reliability over a mission time for repairable equipment.',
    intro: 'Mean time between failures (MTBF) is the average operating time between failures of repairable equipment. The calculator also gives the failure rate and, with a mission time, the probability of running that long without failure under a constant-failure-rate assumption.',
    formulas: ['MTBF = Total operating time ÷ Number of failures', 'Failure rate λ = 1 ÷ MTBF', 'Reliability R(t) = e^(−t ÷ MTBF)'],
    vars: [['Total operating time', 'Running time of the equipment in the period, excluding repair and idle time', 'h'], ['Number of failures', 'Failures needing corrective action that stopped or degraded the function', 'count'], ['Mission time t', 'Duration for which you want the probability of no failure', 'h']],
    exampleContext: 'A crusher ran 2,160 hours over a quarter and had 9 failures that needed corrective maintenance. The team wants to know the chance of completing a 100-hour campaign without a failure.',
    sections: [
      { h: 'Getting a trustworthy MTBF', html: '<ul><li><strong>Define "failure".</strong> Agree which events count (functional failures only, or every corrective work order) and apply it consistently.</li><li><strong>Use operating time</strong>, not calendar time, for continuously wearing equipment. For standby equipment, use calendar time and say so.</li><li><strong>Watch sample size.</strong> With few failures, MTBF is uncertain. A single extra failure can change it a lot.</li></ul>' },
      { h: 'Limits of the reliability estimate', html: '<p>The exponential formula assumes failures happen at a constant rate: random, with no wear-out. Bearings, belts, liners and other wear components usually have rising failure rates. For those, a Weibull analysis of time-to-failure data is more realistic, and preventive replacement intervals should come from it.</p>' },
      { h: 'Standards', html: '<p>IEC 60050-192 (International Electrotechnical Vocabulary, dependability) and EN 13306 (maintenance terminology) give formal definitions of failure, MTBF and related terms. They are useful reference points when aligning maintenance KPIs between sites.</p>' }
    ],
    faq: [{ q: 'What is the difference between MTBF and MTTF?', a: 'MTBF applies to repairable items that return to service after a failure. MTTF (mean time to failure) applies to non-repairable items that are replaced.' }, { q: 'Does MTBF include repair time?', a: 'Not in the operating-time definition used here. Some organisations use calendar time between failures. That figure includes repair time and should be labelled differently.' }],
    related: ['mttr', 'availability', 'downtime-cost', 'oee']
  },
  {
    id: 'mttr', category: 'maintenance', title: 'MTTR Calculator',
    seoTitle: 'MTTR Calculator – Mean Time to Repair',
    description: 'Calculate mean time to repair (MTTR) in hours and minutes, and inherent availability when MTBF is known.',
    intro: 'Mean time to repair (MTTR) is the average time to restore equipment after a failure. Enter the total corrective maintenance time and the number of repairs. Add MTBF to see the resulting inherent availability.',
    formulas: ['MTTR = Total corrective maintenance time ÷ Number of repairs', 'Inherent availability = MTBF ÷ (MTBF + MTTR)'],
    vars: [['Corrective maintenance time', 'From stop to restart: detection, diagnosis, waiting for people and parts, repair, test', 'h'], ['Number of repairs', 'Corrective interventions in the same period', 'count']],
    exampleContext: 'Over a quarter, 9 corrective repairs on a conveyor drive took 27 hours in total, and MTBF for the same period was 240 hours.',
    sections: [
      { h: 'Break MTTR down to reduce it', html: '<p>Total MTTR hides very different activities. Splitting it into <em>response</em> (time to get a technician on site), <em>diagnosis</em>, <em>logistics</em> (parts, tools, permits) and <em>hands-on repair</em> usually shows that waiting dominates. Waiting is cut through spares strategy, standard repair procedures and clear escalation rules, not faster wrenches.</p>' },
      { h: 'Consistency checks', html: '<ul><li>Use the same start and stop events for every work order: stop to restart is the most common choice.</li><li>Keep preventive maintenance separate: MTTR covers corrective work.</li><li>Report the median as well as the mean. A few long repairs can distort the average.</li></ul>' }
    ],
    faq: [{ q: 'What does the "R" in MTTR stand for?', a: 'Usually "repair", but some organisations use "restore", "recovery" or "respond". Write down which one you mean, because the time boundaries differ.' }],
    related: ['mtbf', 'availability', 'downtime-cost']
  },
  {
    id: 'availability', category: 'maintenance', title: 'Equipment Availability Calculator',
    seoTitle: 'Availability Calculator – From MTBF/MTTR or Uptime',
    description: 'Calculate equipment availability from MTBF and MTTR (inherent availability) or from measured uptime and downtime, with equivalent downtime per year.',
    intro: 'Availability is the share of time equipment can perform its function. Calculate it from reliability figures (MTBF and MTTR) or directly from measured uptime and downtime. The result also shows how much downtime that availability means over a year of continuous operation.',
    formulas: ['Inherent availability = MTBF ÷ (MTBF + MTTR)', 'Achieved availability = Uptime ÷ (Uptime + Downtime)', 'Equivalent downtime per year = (1 − Availability) × 8,760 h'],
    vars: [['MTBF', 'Mean time between failures', 'h'], ['MTTR', 'Mean time to repair', 'h'], ['Uptime / Downtime', 'Measured hours in a defined period', 'h']],
    exampleContext: 'A pump has an MTBF of 240 hours and an MTTR of 3 hours.',
    sections: [
      { h: 'Which availability are you measuring?', html: '<ul><li><strong>Inherent availability</strong> (from MTBF/MTTR): corrective repair time only. It reflects design and maintainability.</li><li><strong>Achieved availability</strong>: adds preventive maintenance time.</li><li><strong>Operational availability</strong>: includes every delay: waiting for parts, people and permits. It is what production experiences.</li></ul><p>Always state which one you report. Production and maintenance teams often argue because they use different definitions.</p>' },
      { h: 'Availability in series systems', html: '<p>When equipment runs in series with no buffers (such as a chain of conveyors), system availability is roughly the product of individual availabilities. Ten units at 99% each give about 90.4% for the chain. This is why buffers, redundancy and bottleneck focus matter in linked systems.</p>' }
    ],
    faq: [{ q: 'Is availability in OEE the same as maintenance availability?', a: 'Not exactly. OEE availability measures all unplanned stops against planned production time, including changeovers and material shortages, not only equipment failures.' }],
    related: ['mtbf', 'mttr', 'oee', 'downtime-cost']
  },
  {
    id: 'downtime-cost', category: 'maintenance', title: 'Downtime Cost Calculator',
    seoTitle: 'Downtime Cost Calculator – Cost of Unplanned Stops',
    description: 'Estimate the cost of unplanned downtime from lost output, contribution margin, idle labour and direct repair costs. Get total cost and cost per hour.',
    intro: 'A stop costs more than its repair bill. This calculator adds up lost contribution margin, idle labour and other direct costs to give the total cost of a downtime event and a cost per hour. Use the cost per hour to rank improvement projects and justify spares.',
    formulas: ['Lost margin = Downtime × Lost production rate × Contribution margin per unit', 'Idle labour = Downtime × Idle workers × Loaded hourly cost', 'Total cost = Lost margin + Idle labour + Other direct costs'],
    vars: [['Lost production rate', 'Output the stopped asset would have produced per hour', 'units/h'], ['Contribution margin', 'Selling price minus variable cost per unit', 'currency/unit'], ['Loaded labour cost', 'Wage plus social charges and overheads per hour', 'currency/h'], ['Other direct costs', 'Spare parts, contractors, scrap, expediting', 'currency']],
    exampleContext: 'A bottleneck filler stopped for 3.5 hours. It normally produces 120 units per hour at a contribution margin of 18 per unit. Eight operators stood idle at a loaded cost of 32 per hour, and parts plus a contractor cost 1,500.',
    sections: [
      { h: 'When is output really lost?', html: '<p>Lost margin applies only if the output cannot be recovered. A stop at a non-bottleneck with buffers or spare capacity may cost almost nothing in sales. A stop at the bottleneck of a sold-out plant loses margin for every hour. Use 0 for margin when the volume will be recovered without overtime, and count the overtime cost instead.</p>' },
      { h: 'Using cost per hour', html: '<ul><li>Multiply by annual downtime hours per asset to rank where reliability work pays most.</li><li>Compare with the cost of holding a critical spare, or of a redundancy investment.</li><li>Feed the result into the <a href="/calculators/payback-period">payback calculator</a> for improvement projects.</li></ul>' }
    ],
    faq: [{ q: 'Should I use selling price instead of margin?', a: 'Not usually. When output is lost, you also avoid its variable costs (materials, energy). Contribution margin is the money actually lost.' }],
    related: ['mttr', 'mtbf', 'availability', 'payback-period', 'oee']
  },

  // ---------------- ENERGY ----------------
  {
    id: 'energy-cost', category: 'energy', title: 'Energy Cost Calculator',
    seoTitle: 'Energy Cost Calculator – kWh & Annual Electricity Cost',
    description: 'Estimate electricity use and cost for a machine or motor from rated power, load, efficiency, operating hours and tariff. Daily, monthly and annual figures.',
    intro: 'Estimate how much electricity a machine, motor or other load uses and what it costs per hour, day, month and year. For motors, enter load and efficiency: nameplate kW is shaft output, not electrical input.',
    formulas: ['Electrical input (kW) = Rated power × Load ÷ Efficiency', 'Energy per day (kWh) = Electrical input × Hours per day', 'Annual cost = Energy per day × Operating days × Price per kWh'],
    vars: [['Rated power', 'Nameplate power of the load', 'kW'], ['Average load', 'Average share of rated power actually drawn', '%'], ['Efficiency', 'Motor efficiency at that load; leave at 100% for non-motor loads with input rating', '%'], ['Energy price', 'Average price per kWh in your currency', 'per kWh']],
    exampleContext: 'A 75 kW conveyor drive motor runs at about 80% load, 16 hours a day, 300 days a year. Efficiency is 94% and energy costs 0.12 per kWh.',
    sections: [
      { h: 'What this estimate leaves out', html: '<ul><li><strong>Demand charges</strong>: many industrial tariffs bill peak kW as well as kWh.</li><li><strong>Reactive energy</strong>: low power factor can trigger penalties. See the <a href="/calculators/power-factor-correction">power factor correction calculator</a>.</li><li><strong>Time-of-use rates</strong>: shifting load to off-peak hours changes the average price.</li></ul><p>For a budget-grade figure, use the average price from recent bills (total cost ÷ total kWh).</p>' },
      { h: 'Getting a better load figure', html: '<p>Nameplate power overstates consumption for most motors, which seldom run at full load. A clamp meter reading combined with the <a href="/calculators/electrical-power">electrical power calculator</a>, or data from a drive or energy meter, gives a much better load estimate.</p>' }
    ],
    faq: [{ q: 'How do I convert kW to kWh?', a: 'Multiply power in kW by operating time in hours. A 10 kW load running 5 hours uses 50 kWh.' }, { q: 'Why include motor efficiency?', a: 'Motor nameplates give mechanical output. Electrical input is higher by the losses, so input = output ÷ efficiency.' }],
    related: ['specific-energy-consumption', 'motor-efficiency-savings', 'electrical-power', 'power-factor-correction']
  },
  {
    id: 'specific-energy-consumption', category: 'energy', title: 'Specific Energy Consumption Calculator',
    seoTitle: 'Specific Energy Consumption Calculator (kWh/t, EnPI)',
    description: 'Calculate specific energy consumption (SEC) in kWh per tonne or per unit, and compare it with a baseline to estimate energy saved or over-consumed.',
    intro: 'Specific energy consumption (SEC) is energy used per unit of output, such as kWh per tonne. It is one of the most widely used energy performance indicators (EnPIs). Compare a period with a baseline to see whether energy performance has improved and by how much.',
    formulas: ['SEC = Energy consumed ÷ Production output', 'Change vs. baseline = SEC ÷ Baseline SEC − 1', 'Energy saved = (Baseline SEC − SEC) × Production output'],
    vars: [['Energy consumed', 'Metered energy for the boundary (site, process, line)', 'kWh'], ['Production output', 'Output over the same period and boundary', 't or units'], ['Baseline SEC', 'Reference SEC from a baseline period', 'kWh/t']],
    exampleContext: 'A bulk-material handling system used 1,840,000 kWh to move 920,000 tonnes in a quarter. The baseline year averaged 2.15 kWh/t.',
    sections: [
      { h: 'When a simple ratio misleads', html: '<p>Most processes have a fixed energy component (lighting, auxiliaries, idling equipment) that does not change with output. When output drops, SEC rises even if nothing got worse. ISO 50006 recommends checking whether a ratio EnPI is suitable or whether a regression model (energy = a × output + b) better represents the relationship. With a model, savings are calculated against the expected energy for the actual output.</p>' },
      { h: 'Good practice', html: '<ul><li>Keep the energy and output boundaries identical.</li><li>Record relevant variables (product mix, ore hardness, ambient temperature) alongside SEC.</li><li>Track SEC at the level where someone can act on it: a line or a major energy user, not just the whole site.</li></ul>' }
    ],
    faq: [{ q: 'Is SEC the same as energy intensity?', a: 'Broadly yes. Energy intensity is often used for economic output (energy per unit of revenue), while SEC usually refers to physical output.' }],
    related: ['energy-cost', 'motor-efficiency-savings', 'belt-conveyor-capacity', 'power-factor-correction']
  },
  {
    id: 'electrical-power', category: 'energy', title: 'Electrical Power Calculator (kW, kVA, kvar)',
    seoTitle: 'Three-Phase Power Calculator – kW, kVA & kvar',
    description: 'Calculate active (kW), apparent (kVA) and reactive (kvar) power from voltage, current and power factor for three-phase or single-phase loads.',
    intro: 'Convert measured voltage, current and power factor into active, apparent and reactive power for three-phase or single-phase loads. Add motor efficiency to estimate shaft output. This is useful for checking a motor’s real load against its nameplate.',
    formulas: ['Three-phase apparent power S = √3 × V × I', 'Single-phase apparent power S = V × I', 'Active power P = S × PF', 'Reactive power Q = √(S² − P²)'],
    vars: [['V', 'Line-to-line voltage (three-phase) or supply voltage (single-phase)', 'V'], ['I', 'Line current', 'A'], ['PF', 'Power factor (cos φ for sinusoidal loads)', '—']],
    exampleContext: 'A clamp meter reads 135 A on a 400 V three-phase motor supply, with a power factor of 0.86. The motor efficiency is 94.5%.',
    sections: [
      { h: 'Practical notes', html: '<ul><li>Measure current on all three phases and use the average. Unbalance above a few percent is a problem in its own right.</li><li>With variable-speed drives, harmonics make the true power factor lower than cos φ. A power analyser gives more reliable kW.</li><li>Comparing estimated shaft output with nameplate kW shows the motor’s load. A motor that runs well below rating most of the time may be oversized.</li></ul>' }
    ],
    faq: [{ q: 'Why multiply by √3 for three-phase?', a: 'With line-to-line voltage V and line current I in a balanced three-phase system, total apparent power is √3 × V × I. It is the sum of the three phase powers expressed in line quantities.' }],
    related: ['power-factor-correction', 'energy-cost', 'motor-efficiency-savings']
  },
  {
    id: 'power-factor-correction', category: 'energy', title: 'Power Factor Correction Calculator',
    seoTitle: 'Power Factor Correction Calculator – Capacitor kvar',
    description: 'Calculate the capacitor bank rating (kvar) needed to raise power factor from its current value to a target, with the resulting reduction in kVA and current.',
    intro: 'Low power factor increases current, losses and often your electricity bill. Enter active power, current power factor and target power factor to get the capacitor rating needed, plus the drop in apparent power and line current.',
    formulas: ['Qc = P × (tan φ₁ − tan φ₂)', 'φ = arccos(PF)', 'Current reduction = 1 − PF₁ ÷ PF₂'],
    vars: [['P', 'Active power of the load', 'kW'], ['PF₁', 'Present power factor', '—'], ['PF₂', 'Target power factor', '—'], ['Qc', 'Capacitor reactive power required', 'kvar']],
    exampleContext: 'A workshop draws 500 kW at a power factor of 0.78. The utility applies penalties below 0.95.',
    sections: [
      { h: 'Before buying capacitors', html: '<ul><li><strong>Harmonics</strong>: drives, rectifiers and welders create harmonics that can resonate with capacitors. Detuned (reactor-protected) banks are often needed. A harmonic survey is recommended.</li><li><strong>Load variation</strong>: automatic stepped banks follow changing loads and avoid over-correction (leading power factor) at light load.</li><li><strong>Location</strong>: correcting at large motors also reduces current in the feeders upstream. Central correction is cheaper but only relieves the supply transformer and tariff.</li></ul>' },
      { h: 'Why aim for 0.95 rather than 1.0?', html: '<p>Each step towards unity needs more kvar for less benefit, and a bank sized for unity at full load over-corrects at partial load. Most tariffs set penalty thresholds between 0.9 and 0.95. Check your own utility’s rules.</p>' }
    ],
    faq: [{ q: 'Does power factor correction reduce kWh?', a: 'Only slightly, through lower I²R losses in cables and transformers downstream of the capacitors. Most of the savings come from avoided reactive-energy penalties and released capacity.' }],
    related: ['electrical-power', 'energy-cost', 'motor-efficiency-savings']
  },
  {
    id: 'motor-efficiency-savings', category: 'energy', title: 'Motor Efficiency Upgrade Savings Calculator',
    seoTitle: 'Motor Efficiency Savings Calculator – IE3/IE4 Payback',
    description: 'Estimate annual kWh and cost savings, and simple payback, from replacing an electric motor with a higher-efficiency model (e.g. IE2 to IE3 or IE4).',
    intro: 'A more efficient motor saves energy every hour it runs. Enter the motor output, load, running hours and the two efficiencies to estimate annual energy and cost savings. Add the installed cost to get simple payback.',
    formulas: ['Output power = Rated output × Load', 'Input power saving = Output × (1 ÷ η_old − 1 ÷ η_new)', 'Annual savings = Input power saving × Hours × Energy price', 'Payback = Installed cost ÷ Annual savings'],
    vars: [['Rated output', 'Motor shaft rating', 'kW'], ['η_old, η_new', 'Efficiency of existing and new motor at the operating load', '%'], ['Hours', 'Annual running hours', 'h/year']],
    exampleContext: 'A 45 kW pump motor runs 6,000 hours a year at 75% load. Its efficiency is 91.0%. An IE4 replacement offers 94.6% and costs 4,200 installed. Energy costs 0.12 per kWh.',
    sections: [
      { h: 'Where upgrades pay', html: '<p>Savings grow with running hours and load. Motors that run most of the year and are reasonably loaded are the best candidates. Lightly used or oversized motors may never pay back. Replacing at failure (instead of rewinding) usually gives the best economics, because only the price difference with a like-for-like motor counts.</p>' },
      { h: 'Efficiency classes', html: '<p>IEC 60034-30-1 defines efficiency classes IE1 to IE4 for line-operated motors (IE5 is referenced as a future class). Class limits depend on power rating and pole count, so check the manufacturer’s data sheet for the actual efficiency at your load point.</p>' },
      { h: 'Look at the system first', html: '<p>Motor efficiency is one link in the chain. Throttled valves, dampers and oversized pumps often waste more energy than motor losses. A variable-speed drive or correct sizing can give larger savings. Check the driven system before upgrading the motor.</p>' }
    ],
    faq: [{ q: 'Does a rewound motor lose efficiency?', a: 'It can. A poor-quality rewind can lower efficiency, while a rewind done to good-practice standards largely keeps it. Ask the repair shop for test data.' }],
    related: ['energy-cost', 'payback-period', 'electrical-power', 'specific-energy-consumption']
  },

  // ---------------- INVENTORY & LOGISTICS ----------------
  {
    id: 'reorder-point', category: 'inventory', title: 'Reorder Point Calculator',
    seoTitle: 'Reorder Point Calculator – When to Reorder Stock',
    description: 'Calculate the reorder point from average daily demand, lead time and safety stock, and check whether your current inventory position means you should order now.',
    intro: 'The reorder point is the inventory level at which you place a new order, so stock arrives before you run out. Enter demand, lead time and safety stock. Add your current inventory position to see whether to order now.',
    formulas: ['Lead-time demand = Average daily demand × Lead time', 'Reorder point = Lead-time demand + Safety stock'],
    vars: [['Average daily demand', 'Typical consumption per day', 'units/day'], ['Lead time', 'Days from placing an order to stock being available', 'days'], ['Safety stock', 'Buffer for demand and lead-time variability', 'units'], ['Inventory position', 'On hand + on order − backorders', 'units']],
    exampleContext: 'A spare part is consumed at about 40 units per day. The supplier delivers in 7 days, and the planner keeps 85 units of safety stock. Current position is 520 units.',
    sections: [
      { h: 'Use inventory position, not on-hand stock', html: '<p>Compare the reorder point with <em>inventory position</em> (on hand + already on order − backorders), not just what is on the shelf. Otherwise you may reorder again while a previous order is still in transit.</p>' },
      { h: 'Setting the safety stock', html: '<p>Safety stock protects against demand and lead-time variation during the replenishment cycle. The <a href="/calculators/safety-stock">safety stock calculator</a> sizes it statistically from the service level you target.</p>' }
    ],
    faq: [{ q: 'What if demand is seasonal?', a: 'Recalculate the reorder point when the demand rate changes, or use a forecast of demand over the coming lead time instead of a historical average.' }],
    related: ['safety-stock', 'eoq', 'inventory-turnover']
  },
  {
    id: 'safety-stock', category: 'inventory', title: 'Safety Stock Calculator',
    seoTitle: 'Safety Stock Calculator – Service Level & Lead Time',
    description: 'Calculate safety stock for a target service level from demand variability and lead-time variability, using the combined statistical formula.',
    intro: 'Safety stock is the buffer that protects you from stockouts when demand or lead time varies. This calculator uses the standard statistical formula. It combines demand variability and lead-time variability for a target cycle service level, and also returns the resulting reorder point.',
    formulas: ['SS = z × √(LT × σd² + d² × σLT²)', 'z = Φ⁻¹(Service level)', 'Reorder point = d × LT + SS'],
    vars: [['d', 'Average daily demand', 'units/day'], ['σd', 'Standard deviation of daily demand', 'units/day'], ['LT', 'Average lead time', 'days'], ['σLT', 'Standard deviation of lead time', 'days'], ['z', 'Service factor for the target cycle service level', '—']],
    exampleContext: 'An item averages 40 units of demand per day with a daily standard deviation of 12. Lead time averages 7 days with a standard deviation of 1.5 days. The target cycle service level is 95%.',
    sections: [
      { h: 'Choosing a service level', html: '<p>Safety stock rises steeply as service level approaches 100%. Moving from 95% to 99% raises the z-factor from about 1.645 to 2.326, roughly 41% more safety stock. Set service levels by item class (for example by criticality or ABC class) instead of applying 99% everywhere.</p><p>Cycle service level is the probability of no stockout during one replenishment cycle. It is not the same as fill rate (the share of demand served from stock). Fill rate is usually higher for the same safety stock.</p>' },
      { h: 'When the formula does not fit', html: '<ul><li>Intermittent or lumpy demand (many zero-demand days) breaks the normal-distribution assumption.</li><li>Strong trends or seasonality need forecast-error variability, not raw demand variability.</li><li>For critical spares with very low usage, use a Poisson-based or risk-based method.</li></ul>' }
    ],
    faq: [{ q: 'What if lead time is constant?', a: 'Leave the lead-time standard deviation blank (zero). The formula then becomes z × σd × √LT.' }],
    related: ['reorder-point', 'eoq', 'inventory-turnover']
  },
  {
    id: 'eoq', category: 'inventory', title: 'EOQ Calculator (Economic Order Quantity)',
    seoTitle: 'EOQ Calculator – Economic Order Quantity & Total Cost',
    description: 'Calculate the economic order quantity (EOQ), number of orders per year, order interval and total annual ordering and holding cost.',
    intro: 'The economic order quantity balances the cost of placing orders against the cost of holding stock. Enter annual demand, cost per order and annual holding cost per unit to get the optimal lot size and the annual costs at that quantity.',
    formulas: ['EOQ = √(2 × D × S ÷ H)', 'Orders per year = D ÷ EOQ', 'Total cost = (D ÷ Q) × S + (Q ÷ 2) × H'],
    vars: [['D', 'Annual demand', 'units/year'], ['S', 'Fixed cost per order (admin, receiving, transport fixed part)', 'currency/order'], ['H', 'Holding cost per unit per year', 'currency/unit/year']],
    exampleContext: 'A distributor sells 12,000 units of an item a year. Each purchase order costs 75 to process, and holding one unit for a year costs 2.40.',
    sections: [
      { h: 'Using EOQ in practice', html: '<p>The total-cost curve is flat around the optimum. Ordering 20% more or less than EOQ usually raises total cost by only a few percent. So round EOQ to practical pack, pallet or truck quantities without worrying.</p><p>EOQ assumes steady demand, a fixed cost per order and no quantity discounts. With price breaks, compare total cost (including purchase price) at each break quantity.</p>' },
      { h: 'Estimating the holding cost', html: '<p>Holding cost includes cost of capital, storage space, insurance, handling, obsolescence and shrinkage. Companies often express it as a percentage of unit cost per year. Use your own finance team’s rate where possible.</p>' }
    ],
    faq: [{ q: 'Is EOQ relevant for lean / just-in-time?', a: 'Lean reduces the cost per order (setup) instead of accepting it, which mathematically lowers EOQ. The formula shows why setup reduction allows smaller lots.' }],
    related: ['reorder-point', 'safety-stock', 'inventory-turnover']
  },
  {
    id: 'inventory-turnover', category: 'inventory', title: 'Inventory Turnover Calculator',
    seoTitle: 'Inventory Turnover & Days of Inventory Calculator',
    description: 'Calculate inventory turnover ratio and days inventory outstanding (DIO) from cost of goods sold and beginning and ending inventory.',
    intro: 'Inventory turnover shows how many times inventory is used up and replaced in a period. Days inventory outstanding (DIO) gives the same information as the average number of days stock sits before it is used or sold.',
    formulas: ['Average inventory = (Beginning + Ending inventory) ÷ 2', 'Inventory turnover = COGS ÷ Average inventory', 'DIO = Days in period ÷ Inventory turnover'],
    vars: [['COGS', 'Cost of goods sold over the period', 'currency'], ['Beginning / ending inventory', 'Inventory valued at cost', 'currency'], ['Days in period', '365 for a year, 90 for a quarter, etc.', 'days']],
    exampleContext: 'A manufacturer reports annual COGS of 2.4 million, with inventory of 380,000 at the start of the year and 420,000 at the end.',
    sections: [
      { h: 'Interpreting the ratio', html: '<p>Higher turnover means less capital tied up per unit of sales. But very high turnover can also signal stockouts and lost sales. Benchmarks vary widely by industry, so compare with your own history and with peers in the same sector.</p><p>Two data points (start and end) can misrepresent seasonal businesses. Use monthly averages where possible.</p>' }
    ],
    faq: [{ q: 'Why use COGS instead of sales?', a: 'Inventory is valued at cost, so COGS is the consistent numerator. Using sales (at selling price) inflates the ratio.' }],
    related: ['eoq', 'safety-stock', 'littles-law']
  },
  {
    id: 'belt-conveyor-capacity', category: 'inventory', title: 'Belt Conveyor Capacity Calculator',
    seoTitle: 'Belt Conveyor Capacity Calculator – Tonnes per Hour',
    description: 'Calculate belt conveyor capacity in t/h from load cross-section, belt speed and bulk density, or from load per metre and belt speed.',
    intro: 'Estimate the conveying capacity of a belt conveyor in tonnes per hour. Use the load cross-section area (from troughing geometry), bulk density and belt speed. Or, if you know the load per metre of belt, use that with belt speed.',
    formulas: ['Volumetric capacity (m³/h) = 3,600 × A × fill × v', 'Mass capacity (t/h) = Volumetric capacity × ρ', 'Mass capacity (t/h) = 3.6 × q × v'],
    vars: [['A', 'Load cross-section area at full trough', 'm²'], ['v', 'Belt speed', 'm/s'], ['ρ', 'Loose bulk density of the material', 't/m³'], ['q', 'Material load per metre of belt', 'kg/m'], ['fill', 'Degree of filling relative to the full cross-section', '%']],
    exampleContext: 'An overland conveyor has a load cross-section of 0.12 m² at full trough, runs at 4.2 m/s and carries ore with a bulk density of 1.4 t/m³.',
    sections: [
      { h: 'Where the cross-section comes from', html: '<p>The load area depends on belt width, troughing angle, idler arrangement, edge distance and the material’s surcharge angle. Standard methods (CEMA, ISO 5048, DIN 22101) give formulas and tables to calculate it. For inclined conveyors, apply the reduction factor from the same standard.</p>' },
      { h: 'Using load per metre', html: '<p>Belt weighers report instantaneous t/h, and load per metre can be derived from the belt scale and speed. The relation q = Q ÷ (3.6 × v) also lets you check whether the belt is being under- or over-filled at a given throughput.</p>' },
      { h: 'Operational notes', html: '<ul><li>Running consistently below design fill wastes energy per tonne. Specific energy consumption rises when belts run partly empty.</li><li>Overfilling causes spillage, which drives cleaning workload and idler failures.</li><li>In a chain of conveyors, system capacity is set by the lowest-capacity link. Check transfer points as well as belts.</li></ul>' }
    ],
    faq: [{ q: 'Why multiply by 3.6 in the load-per-metre formula?', a: 'q (kg/m) × v (m/s) gives kg/s. Multiplying by 3,600 s/h and dividing by 1,000 kg/t gives t/h, so the factor is 3.6.' }],
    related: ['capacity-utilization', 'specific-energy-consumption', 'energy-cost', 'availability']
  },

  // ---------------- FINANCE ----------------
  {
    id: 'roi', category: 'finance', title: 'ROI Calculator',
    seoTitle: 'ROI Calculator – Return on Investment & Annualized ROI',
    description: 'Calculate return on investment (ROI), net gain and annualized ROI (CAGR) from investment cost, total return and holding period.',
    intro: 'Return on investment compares the net gain from an investment with its cost. Enter the total cost and total return. Add the holding period to get the annualized return, so you can compare projects of different lengths fairly.',
    formulas: ['Net gain = Total return − Investment cost', 'ROI = Net gain ÷ Investment cost', 'Annualized ROI = (Total return ÷ Investment cost)^(1 ÷ years) − 1'],
    vars: [['Investment cost', 'All costs to acquire and implement', 'currency'], ['Total return', 'Total benefits received over the period (savings, extra margin, resale value)', 'currency'], ['Years', 'Holding or evaluation period', 'years']],
    exampleContext: 'An automation project costs 50,000 and is expected to return 68,000 in labour and scrap savings over 3 years.',
    sections: [
      { h: 'Limitations of simple ROI', html: '<p>Simple ROI ignores <em>when</em> the returns arrive and how uncertain they are. Two projects with the same ROI can differ a lot if one pays back in year one and the other in year five. For capital decisions, also look at <a href="/calculators/payback-period">payback period</a>, net present value and risk.</p>' },
      { h: 'Building a credible ROI for an improvement project', html: '<ul><li>Count only savings you can measure: reduced hours, scrap, energy (see <a href="/calculators/energy-cost">energy cost</a>) or downtime (see <a href="/calculators/downtime-cost">downtime cost</a>).</li><li>Include implementation costs: training, lost production during installation, maintenance.</li><li>State the baseline and how savings will be verified after the project.</li></ul>' }
    ],
    faq: [{ q: 'Can ROI be negative?', a: 'Yes. If total return is less than cost, net gain and ROI are negative: the investment lost money.' }],
    related: ['payback-period', 'break-even', 'motor-efficiency-savings', 'downtime-cost']
  },
  {
    id: 'payback-period', category: 'finance', title: 'Payback Period Calculator',
    seoTitle: 'Payback Period Calculator – Years to Recover Investment',
    description: 'Calculate simple payback period in years and months from initial investment and annual net cash inflow, and check it against useful life.',
    intro: 'The payback period is the time an investment takes to recover its cost from the cash it generates. It is the first screen most operations improvement projects go through. Enter the investment and annual net inflow, and optionally the asset’s useful life.',
    formulas: ['Payback period = Initial investment ÷ Annual net cash inflow', 'Undiscounted net gain = Annual inflow × Useful life − Investment'],
    vars: [['Initial investment', 'Up-front cost including installation', 'currency'], ['Annual net cash inflow', 'Yearly savings or extra profit after operating costs', 'currency/year'], ['Useful life', 'Expected service life', 'years']],
    exampleContext: 'A variable-speed drive retrofit on a fan costs 85,000 installed and saves 31,000 a year in energy. Its useful life is about 8 years.',
    sections: [
      { h: 'Strengths and weaknesses', html: '<p>Payback is easy to explain and favours fast, low-risk returns, which is useful when cash or certainty is limited. It ignores the time value of money and everything that happens after payback. A project with a slightly longer payback but a much longer life can be worth more. Use payback as a screen and net present value for the final decision.</p>' },
      { h: 'Uneven cash flows', html: '<p>If savings vary year to year (ramp-up, degradation), add cumulative cash flows year by year until they exceed the investment. This calculator assumes a constant annual inflow.</p>' }
    ],
    faq: [{ q: 'What is a good payback period?', a: 'It depends on company policy and risk. Thresholds of 1 to 3 years are common for operational improvements, while infrastructure is often judged on longer horizons. Use your organisation’s own hurdle.' }],
    related: ['roi', 'break-even', 'motor-efficiency-savings', 'downtime-cost']
  },
  {
    id: 'break-even', category: 'finance', title: 'Break-Even Calculator',
    seoTitle: 'Break-Even Calculator – Units, Revenue & Margin',
    description: 'Calculate break-even volume and revenue from fixed costs, selling price and variable cost per unit, plus the volume needed for a target profit.',
    intro: 'Break-even is the sales volume at which total contribution margin covers fixed costs: no profit, no loss. Enter fixed costs, price and variable cost per unit. Add a target profit to see the volume needed to reach it.',
    formulas: ['Contribution margin = Price − Variable cost per unit', 'Break-even units = Fixed costs ÷ Contribution margin', 'Units for target profit = (Fixed costs + Target profit) ÷ Contribution margin'],
    vars: [['Fixed costs', 'Costs that do not vary with volume in the period (rent, salaries, depreciation)', 'currency'], ['Price', 'Net selling price per unit', 'currency'], ['Variable cost', 'Materials, energy, direct consumables per unit', 'currency']],
    exampleContext: 'A small production unit has 120,000 of fixed costs per year, sells at 45 per unit and has variable costs of 27 per unit. The owners want a profit of 30,000.',
    sections: [
      { h: 'Using break-even analysis', html: '<ul><li>Margin of safety = (expected volume − break-even volume) ÷ expected volume. It shows how far sales can fall before losses begin.</li><li>Raising price or cutting variable cost increases contribution margin and lowers break-even. Cutting fixed costs lowers it directly.</li><li>For several products, use a weighted average contribution margin based on the sales mix.</li></ul>' }
    ],
    faq: [{ q: 'Is direct labour fixed or variable?', a: 'It depends on how labour is managed. If headcount is fixed over the period, treat labour as fixed. If hours flex with volume (temporary staff, overtime), treat that part as variable.' }],
    related: ['roi', 'payback-period', 'downtime-cost']
  },

  // ---------------- WORKFORCE ----------------
  {
    id: 'working-hours', category: 'workforce', title: 'Working Hours Calculator',
    seoTitle: 'Working Hours Calculator – Shift Hours Minus Breaks',
    description: 'Calculate net working hours from start and end times minus unpaid breaks, including overnight shifts, in hours/minutes and decimal hours.',
    intro: 'Enter a shift’s start and end times and the unpaid break to get the net hours worked, in hours and minutes and in decimal hours for payroll or capacity planning. Overnight shifts are handled automatically. Add days per week for a weekly total.',
    formulas: ['Shift span = End time − Start time (add 24 h if the shift ends the next day)', 'Net working time = Shift span − Unpaid break'],
    vars: [['Start / end time', 'Clock times in 24-hour format', 'HH:MM'], ['Unpaid break', 'Meal or rest breaks not counted as working time', 'min']],
    exampleContext: 'An operator starts at 07:30, finishes at 16:15 and takes a 45-minute unpaid lunch break, five days a week.',
    sections: [
      { h: 'Decimal hours vs. hours and minutes', html: '<p>Payroll and planning systems usually need decimal hours: 7 h 45 min is 7.75 h, not 7.45. Divide the minutes by 60 to convert. This calculator shows both forms.</p>' },
      { h: 'Good to know', html: '<ul><li>Rules on paid and unpaid breaks, maximum hours and overtime differ by country and by collective agreement. Check the rules that apply to you.</li><li>For capacity planning, subtract paid breaks and meetings too. That gives the available time used in the <a href="/calculators/takt-time">takt time calculator</a>.</li></ul>' }
    ],
    faq: [{ q: 'How does the calculator handle night shifts?', a: 'If the end time is earlier than the start time, it assumes the shift ends the next day and adds 24 hours.' }, { q: 'How do I total hours for a rotating shift pattern?', a: 'Calculate the net hours of each shift type once, multiply by the number of each shift worked in the cycle, and divide by the cycle length in weeks for an average weekly figure. For example, a 4-on/4-off pattern of 12-hour shifts with 1 hour of unpaid break gives 11 h × 4 shifts every 8 days, which averages 38.5 hours per week.' }],
    related: ['labor-productivity', 'takt-time', 'production-rate']
  },
  {
    id: 'labor-productivity', category: 'workforce', title: 'Labor Productivity Calculator',
    seoTitle: 'Labor Productivity Calculator – Output per Labor Hour',
    description: 'Calculate labor productivity as output per labor hour, labor hours per unit and output per worker, and compare with a baseline.',
    intro: 'Labor productivity measures output per hour of work. Enter output, number of workers and hours worked to get output per labor hour, labor hours per unit and output per worker. Add a baseline to see the change.',
    formulas: ['Labor hours = Workers × Hours per worker', 'Labor productivity = Output ÷ Labor hours', 'Labor hours per unit = Labor hours ÷ Output'],
    vars: [['Output', 'Good units (or another output measure such as tonnes) in the period', 'units'], ['Workers', 'People whose hours are counted', 'count'], ['Hours per worker', 'Hours worked by each in the period', 'h']],
    exampleContext: 'A team of 12 worked 40 hours each in a week and produced 5,400 units. Last quarter’s average was 10.5 units per labor hour.',
    sections: [
      { h: 'Interpreting changes', html: '<p>Productivity can rise for good reasons (better methods, less rework, fewer stops) or misleading ones (product mix shifting to simpler items, deferred maintenance, hours not recorded). Check mix and quality before attributing a change to performance.</p><p>Compare like with like: direct labour only, or all labour, but the same definition each period.</p>' }
    ],
    faq: [{ q: 'Should overtime hours be included?', a: 'Yes. All hours worked should be counted, otherwise productivity looks better than it is.' }],
    related: ['working-hours', 'production-rate', 'oee']
  }
];

// ---- Additional practitioner sections (kept separate for easier review) ----
const extra = {
  'labor-productivity': [{ h: 'Choosing the right output measure', html: '<p>Output per labour hour works when the products are similar. With a varied mix, a simple unit count rewards making easy products. Two common fixes:</p><ul><li><strong>Standard hours earned</strong>: multiply each product’s output by its standard time, then divide by actual hours worked. The result is labour efficiency against standard.</li><li><strong>Weighted units</strong>: convert products into an equivalent reference unit, using their relative work content.</li></ul><p>For process industries, tonnes per labour hour or tonnes per employee per year are the usual measures. They only make sense when compared at similar levels of automation.</p>' }, { h: 'Linking productivity to improvement work', html: '<p>Labour productivity is an outcome. The levers sit upstream: less waiting for material, shorter changeovers, fewer quality problems, better line balance. Track one or two of these drivers next to the productivity figure, so the team can see what moved it.</p>' }],
  'inventory-turnover': [{ h: 'Turnover by item class', html: '<p>A single turnover figure for the whole warehouse averages fast movers with slow and obsolete stock. Calculate turnover by ABC class or product family. Then list the items with no movement in the last 6 or 12 months. They tie up capital and space and usually need a decision: use, sell, or write off.</p><p>For maintenance spares, low turnover is often intentional. Critical insurance spares are held for availability, not rotation. Judge them by the downtime risk they cover (see the <a href="/calculators/downtime-cost">downtime cost calculator</a>), not by turnover.</p>' }],
  'capacity-utilization': [{ h: 'Worked interpretation', html: '<p>In the example, utilization is 72% and efficiency is 84.7%. So 1,500 tonnes per month of the gap between design and actual is lost to planned allowances (design minus effective capacity), and 1,300 tonnes to operating losses (effective minus actual). The first is a planning and maintenance-strategy question. The second is a shop-floor question that OEE and loss analysis can break down further.</p>' }, { h: 'Utilization and lead time', html: '<p>Queueing theory shows that waiting time rises sharply as utilization approaches 100% when arrivals and processing times vary. A resource at 95% utilization can have several times the queue of one at 80%. For bottleneck equipment this is a reason to protect capacity. For non-bottlenecks it is a reason not to chase high utilization for its own sake.</p>' }],
  'mttr': [{ h: 'Typical MTTR improvement levers', html: '<ul><li><strong>Fault diagnosis</strong>: alarm lists with probable causes, troubleshooting guides for repeat failures, and condition data available at the machine.</li><li><strong>Spares</strong>: critical spares stocked, identified and kitted. A part that exists but cannot be found adds to repair time.</li><li><strong>Standard work for repairs</strong>: documented procedures for frequent repairs, with tools and isolation points listed.</li><li><strong>Modular replacement</strong>: replace an assembly and repair it off-line, instead of repairing in place.</li></ul><p>Measure each lever’s effect by tracking the components of MTTR (response, diagnosis, logistics, repair) separately for a few months.</p>' }],
  'working-hours': [{ h: 'Converting minutes to decimal hours', html: '<div class="table-scroll"><table class="data"><caption>Common conversions</caption><thead><tr><th scope="col">Minutes</th><th scope="col">Decimal hours</th></tr></thead><tbody><tr><td>6 min</td><td>0.10 h</td></tr><tr><td>15 min</td><td>0.25 h</td></tr><tr><td>20 min</td><td>0.33 h</td></tr><tr><td>30 min</td><td>0.50 h</td></tr><tr><td>40 min</td><td>0.67 h</td></tr><tr><td>45 min</td><td>0.75 h</td></tr></tbody></table></div><p>To convert decimal hours back to minutes, multiply the decimal part by 60: 0.6 h × 60 = 36 minutes.</p>' }],
  'break-even': [{ h: 'Worked interpretation', html: '<p>In the example, each unit contributes 18 towards fixed costs (45 − 27), a contribution margin ratio of 40%. Covering 120,000 of fixed costs takes 6,667 units, or 300,000 of revenue. Every unit sold above that adds 18 of profit, so reaching a 30,000 profit needs 1,667 more units.</p><p>Sensitivity check: a price cut of 3 per unit lowers the margin to 15 and raises break-even to 8,000 units, 20% more volume for a 6.7% price change. Price and variable cost changes affect break-even much more strongly than they first appear.</p>' }],
  'production-rate': [{ h: 'Rate vs. capacity planning', html: '<p>To estimate how long an order will take, divide the quantity by the <em>observed</em> rate, not the nameplate rate. If you only have a design rate, multiply it by a realistic OEE or efficiency figure from your own history. In the example, a 1,500-case order at the observed 138 cases per hour needs about 10.8 scheduled hours, compared with 10 hours at standard rate.</p>' }],
  'reorder-point': [{ h: 'Reorder point and order quantity work together', html: '<p>The reorder point decides <em>when</em> to order. The order quantity decides <em>how much</em>. A common setup is a continuous-review (s, Q) system: when the inventory position falls to the reorder point s, order a fixed quantity Q. Q is often set with the <a href="/calculators/eoq">EOQ calculator</a> and rounded to pack sizes.</p><p>In a periodic-review system, where you check stock every week, for example, protection must cover the review period plus the lead time. Use (review period + lead time) in place of lead time when calculating demand and safety stock.</p>' }],
  'electrical-power': [{ h: 'Estimating motor load from current', html: '<p>Measured kW divided by the motor’s rated input kW (rated output ÷ rated efficiency) gives a load estimate. For example, if the motor measured above is rated 90 kW with 95% efficiency, its rated input is about 94.7 kW, so 80.4 kW measured means about 85% load. Current alone is a poor load indicator at light load, because the magnetising current stays almost constant while power factor drops.</p>' }],
  'roi': [{ h: 'Worked interpretation', html: '<p>In the example, the project returns 68,000 on 50,000, a net gain of 18,000 and an ROI of 36% over three years. Annualised, that is about 10.8% per year: a better figure for comparing with a 1-year project or with the company’s cost of capital. A 36% ROI that takes three years is not the same as 36% in one year.</p>' }],
  'availability': [{ h: 'How availability targets translate into hours', html: '<div class="table-scroll"><table class="data"><caption>Downtime allowed per year of continuous (8,760 h) operation</caption><thead><tr><th scope="col">Availability</th><th scope="col">Downtime per year</th></tr></thead><tbody><tr><td>90%</td><td>876 h</td></tr><tr><td>95%</td><td>438 h</td></tr><tr><td>98%</td><td>175 h</td></tr><tr><td>99%</td><td>88 h</td></tr><tr><td>99.5%</td><td>44 h</td></tr></tbody></table></div><p>Moving from 98% to 99% halves the downtime budget. That usually needs a change in maintenance strategy (condition monitoring, redundancy, faster restoration), not just more effort.</p>' }],
  'power-factor-correction': [{ h: 'Worked interpretation', html: '<p>In the example, raising the power factor from 0.78 to 0.95 needs about 237 kvar. Apparent power falls from 641 kVA to 526 kVA, freeing about 115 kVA of transformer and cable capacity. A standard 250 kvar automatic bank in steps would typically be selected, with step sizes matched to how the load varies.</p>' }],
  'payback-period': [{ h: 'Worked interpretation', html: '<p>In the example, 85,000 is recovered in about 2.7 years from 31,000 of annual savings. Over an 8-year life, the undiscounted net gain is 163,000. Discounting at, say, 10% a year would reduce that figure. The project still clearly pays back within its life, so payback alone is enough to pass a screening step, and a net present value calculation can follow for the final decision.</p>' }],
  'cycle-time': [{ h: 'Measuring cycle time on the shop floor', html: '<ul><li>Time at least 10 to 20 consecutive cycles, and note anything unusual (minor stops, waiting for material).</li><li>Record the lowest repeatable value as well as the average. The difference shows how much instability costs.</li><li>For manual work, separate operator cycle time from machine cycle time. The longer of the two sets the pace.</li></ul>' }]
};
for (const p of pages) if (extra[p.id]) p.sections.push(...extra[p.id]);

// ---- V4: new calculators, structured mistakes/applications, extra internal links ----
import { newPages, mistakes as v4Mistakes, applications as v4Applications } from './content-v4.mjs';
pages.push(...newPages);
for (const p of pages) {
  if (!p.mistakes && v4Mistakes[p.id]) p.mistakes = v4Mistakes[p.id];
  if (!p.applications && v4Applications[p.id]) p.applications = v4Applications[p.id];
}
const extraLinks = {
  'oee': ['teep'], 'capacity-utilization': ['teep'], 'energy-cost': ['pump-power', 'co2-emissions'],
  'specific-energy-consumption': ['co2-emissions', 'compressed-air-leak-cost'], 'motor-efficiency-savings': ['affinity-laws'],
  'payback-period': ['npv'], 'roi': ['npv'], 'break-even': ['unit-cost'], 'eoq': ['inventory-carrying-cost'],
  'inventory-turnover': ['inventory-carrying-cost'], 'first-pass-yield': ['unit-cost'], 'electrical-power': ['pump-power']
};
for (const [id, add] of Object.entries(extraLinks)) {
  const p = pages.find((x) => x.id === id);
  for (const a of add) if (!p.related.includes(a)) p.related.push(a);
}
