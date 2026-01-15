-- Seed data for Master Plumbing Study App
-- Run after schema.sql

-- Get subject IDs (using the slugs we know)
DO $$
DECLARE
  code_id UUID;
  arithmetic_id UUID;
  sanitation_id UUID;
  practical_id UUID;
  topic_venting UUID;
  topic_drainage UUID;
  topic_sizing UUID;
  topic_calculations UUID;
  topic_backflow UUID;
  topic_water UUID;
  topic_troubleshooting UUID;
  topic_scenarios UUID;
BEGIN
  -- Get subject IDs
  SELECT id INTO code_id FROM subjects WHERE slug = 'plumbing-code';
  SELECT id INTO arithmetic_id FROM subjects WHERE slug = 'plumbing-arithmetic';
  SELECT id INTO sanitation_id FROM subjects WHERE slug = 'sanitation-design';
  SELECT id INTO practical_id FROM subjects WHERE slug = 'practical-problems';

  -- Create topics for Plumbing Code
  INSERT INTO topics (subject_id, name, slug, description, display_order)
  VALUES 
    (code_id, 'Venting Requirements', 'venting', 'Vent sizing, types, and installation', 1),
    (code_id, 'Drainage & Traps', 'drainage', 'Drain sizing, trap requirements, and slopes', 2)
  ON CONFLICT (subject_id, slug) DO NOTHING;

  SELECT id INTO topic_venting FROM topics WHERE subject_id = code_id AND slug = 'venting';
  SELECT id INTO topic_drainage FROM topics WHERE subject_id = code_id AND slug = 'drainage';

  -- Create topics for Plumbing Arithmetic
  INSERT INTO topics (subject_id, name, slug, description, display_order)
  VALUES 
    (arithmetic_id, 'Pipe Sizing', 'sizing', 'DFU calculations and pipe size selection', 1),
    (arithmetic_id, 'Slope & Fall Calculations', 'calculations', 'Drain slopes, fall, and pressure', 2)
  ON CONFLICT (subject_id, slug) DO NOTHING;

  SELECT id INTO topic_sizing FROM topics WHERE subject_id = arithmetic_id AND slug = 'sizing';
  SELECT id INTO topic_calculations FROM topics WHERE subject_id = arithmetic_id AND slug = 'calculations';

  -- Create topics for Sanitation & Design
  INSERT INTO topics (subject_id, name, slug, description, display_order)
  VALUES 
    (sanitation_id, 'Backflow Prevention', 'backflow', 'Cross-connection control and protection', 1),
    (sanitation_id, 'Potable Water Systems', 'water', 'Water supply design and safety', 2)
  ON CONFLICT (subject_id, slug) DO NOTHING;

  SELECT id INTO topic_backflow FROM topics WHERE subject_id = sanitation_id AND slug = 'backflow';
  SELECT id INTO topic_water FROM topics WHERE subject_id = sanitation_id AND slug = 'water';

  -- Create topics for Practical Problems
  INSERT INTO topics (subject_id, name, slug, description, display_order)
  VALUES 
    (practical_id, 'Troubleshooting', 'troubleshooting', 'Diagnosing common plumbing issues', 1),
    (practical_id, 'Job-Site Scenarios', 'scenarios', 'Real-world decision making', 2)
  ON CONFLICT (subject_id, slug) DO NOTHING;

  SELECT id INTO topic_troubleshooting FROM topics WHERE subject_id = practical_id AND slug = 'troubleshooting';
  SELECT id INTO topic_scenarios FROM topics WHERE subject_id = practical_id AND slug = 'scenarios';

  -- Insert Plumbing Code flashcards
  INSERT INTO flashcards (topic_id, type, front_content, back_content, explanation, code_reference, difficulty)
  VALUES
    (topic_drainage, 'recall', 
     'What is the minimum trap seal depth required for floor drains?',
     '2 inches (50mm)',
     'A 2-inch trap seal prevents sewer gases from entering the building. Deeper seals may be required for industrial applications.',
     'IPC Section 1002.4', 1),
    
    (topic_drainage, 'multiple_choice',
     'What is the maximum distance a P-trap can be from the fixture it serves?',
     '24 inches (610mm)',
     'The trap must be installed as close to the fixture as possible.',
     'IPC Section 1002.2', 2),
    
    (topic_venting, 'recall',
     'What is the minimum vent pipe size for a single bathroom group?',
     '1.5 inches (38mm)',
     'A bathroom group typically includes a WC, lavatory, and bathtub/shower.',
     'IPC Table 906.1', 2),
    
    (topic_drainage, 'recall',
     'What is the minimum slope for a horizontal drain 3 inches or smaller?',
     '1/4 inch per foot',
     'Smaller pipes need steeper slopes to maintain proper velocity.',
     'IPC Table 704.1', 1),
    
    (topic_venting, 'multiple_choice',
     'What type of vent connects to the building drain and extends through the roof?',
     'Stack vent or vent stack',
     'The main vent provides air to the entire drainage system.',
     'IPC Chapter 9', 1);

  -- Update the multiple choice cards with choices
  UPDATE flashcards SET choices = '[
    {"text": "12 inches (305mm)", "isCorrect": false},
    {"text": "24 inches (610mm)", "isCorrect": true},
    {"text": "36 inches (914mm)", "isCorrect": false},
    {"text": "48 inches (1219mm)", "isCorrect": false}
  ]'::jsonb,
  common_mistake = 'Many confuse this with the trap arm length.'
  WHERE front_content LIKE '%maximum distance a P-trap%';

  UPDATE flashcards SET choices = '[
    {"text": "Stack vent or vent stack", "isCorrect": true},
    {"text": "Relief vent", "isCorrect": false},
    {"text": "Circuit vent", "isCorrect": false},
    {"text": "Wet vent", "isCorrect": false}
  ]'::jsonb
  WHERE front_content LIKE '%building drain and extends through the roof%';

  -- Insert Plumbing Arithmetic flashcards
  INSERT INTO flashcards (topic_id, type, front_content, back_content, formula, difficulty, steps)
  VALUES
    (topic_calculations, 'calculation',
     'A horizontal drain has a length of 50 feet. Calculate the total fall if the slope is 1/4 inch per foot.',
     '12.5 inches (or 1 foot 0.5 inches)',
     'Total Fall = Length × Slope = 50ft × 0.25in/ft',
     1,
     '[
       {"step": "Identify the given values", "explanation": "Length = 50 feet, Slope = 1/4 inch per foot (0.25 in/ft)"},
       {"step": "Apply the formula: Fall = Length × Slope", "explanation": "Multiply the drain length by the slope rate"},
       {"step": "50 × 0.25 = 12.5 inches", "explanation": "This is the total vertical drop needed"},
       {"step": "Convert if needed: 12.5 ÷ 12 = 1.04 feet", "explanation": "Approximately 1 foot and 0.5 inches"}
     ]'::jsonb),
    
    (topic_sizing, 'calculation',
     'What size drain is required for a building with 180 total Drainage Fixture Units (DFU)?',
     '4-inch drain',
     'Use DFU table: 3" = 42 DFU, 4" = 216 DFU, 5" = 428 DFU',
     2,
     '[
       {"step": "Find the DFU requirement", "explanation": "Building has 180 total DFUs"},
       {"step": "Reference the sizing table", "explanation": "3-inch handles 42 DFU, 4-inch handles 216 DFU"},
       {"step": "Select appropriate size", "explanation": "180 DFU exceeds 3-inch (42) but is less than 4-inch (216)"},
       {"step": "Answer: 4-inch drain required", "explanation": "Always round up to the next available size"}
     ]'::jsonb),
    
    (topic_calculations, 'calculation',
     'Convert 40 PSI water pressure to feet of head.',
     '92.4 feet of head',
     'Head (ft) = PSI × 2.31',
     1,
     '[
       {"step": "Identify the conversion factor", "explanation": "1 PSI = 2.31 feet of water head"},
       {"step": "Multiply: 40 × 2.31", "explanation": "Apply the conversion formula"},
       {"step": "Result: 92.4 feet", "explanation": "This is the equivalent pressure in feet of head"}
     ]'::jsonb);

  -- Insert Sanitation & Design flashcards
  INSERT INTO flashcards (topic_id, type, front_content, back_content, explanation, difficulty)
  VALUES
    (topic_backflow, 'recall',
     'What is an "air gap" and why is it important in plumbing design?',
     'An air gap is the unobstructed vertical distance between the water outlet and the flood level rim of a fixture. It prevents backflow and cross-contamination.',
     'Air gaps are the most reliable form of backflow prevention. The minimum air gap is typically 2× the diameter of the supply outlet.',
     1),
    
    (topic_backflow, 'scenario',
     'A hospital is installing a new surgical suite. What level of backflow protection is required for the water supply?',
     'An RP (Reduced Pressure Zone) backflow preventer is required for high-hazard applications like hospitals, mortuaries, and laboratories.',
     'High-hazard cross-connections require the highest level of protection. RP assemblies provide a fail-safe design with double check valves and a relief valve.',
     3),
    
    (topic_water, 'recall',
     'What is the maximum temperature for hot water at public lavatory faucets?',
     '110°F (43°C)',
     'This prevents scalding injuries. Mixing valves or tempering valves must be installed.',
     2);

  UPDATE flashcards SET common_mistake = 'A simple dual check valve is NOT sufficient for high-hazard applications.'
  WHERE front_content LIKE '%hospital%surgical suite%';

  -- Insert Practical Problems flashcards
  INSERT INTO flashcards (topic_id, type, front_content, back_content, explanation, difficulty)
  VALUES
    (topic_troubleshooting, 'scenario',
     'A customer complains of slow drainage in multiple fixtures. You notice gurgling sounds when the toilet flushes. What is the most likely cause?',
     'Inadequate venting or a blocked vent stack',
     'Gurgling in multiple fixtures typically indicates a venting problem. When vents are blocked, air cannot enter the system properly, causing slow drainage and trap siphonage.',
     2),
    
    (topic_troubleshooting, 'multiple_choice',
     'You discover that a water heater T&P relief valve is discharging water periodically. What is your first course of action?',
     'Check the water heater temperature and system pressure',
     'Before replacing parts, diagnose the root cause. High temperature (>210°F) or high pressure (>150 psi) will cause T&P discharge.',
     2),
    
    (topic_scenarios, 'scenario',
     'During a rough-in inspection, you notice the contractor installed a 1-1/4" trap for a kitchen sink. Is this acceptable?',
     'No, kitchen sinks require a minimum 1-1/2" trap.',
     'Kitchen sinks have food waste and grease that require larger traps. Code requires minimum 1-1/2" for kitchen sinks.',
     2);

  UPDATE flashcards SET choices = '[
    {"text": "Replace the T&P valve immediately", "isCorrect": false},
    {"text": "Cap off the T&P discharge pipe", "isCorrect": false},
    {"text": "Check the water heater temperature and system pressure", "isCorrect": true},
    {"text": "Install a larger expansion tank", "isCorrect": false}
  ]'::jsonb,
  common_mistake = 'NEVER cap a T&P valve discharge – this creates a dangerous pressure vessel situation.'
  WHERE front_content LIKE '%T&P relief valve%';

END $$;
