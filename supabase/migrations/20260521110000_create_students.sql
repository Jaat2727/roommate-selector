CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  roll TEXT NOT NULL,
  room TEXT
);

-- Enable RLS but allow anon access
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for anon" ON students FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'students'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE students;
  END IF;
END
$$;

-- Insert initial data
INSERT INTO students (id, name, roll, room) VALUES 
('1', 'Kanishk Kanojia', 'CY25B026', null),
('2', 'Mayank Rana', 'CY25B027', null),
('3', 'Aditya Ravi Wathrey', 'CY25B025', null),
('4', 'Pranjal', 'CY25B028', null),
('5', 'Puru Sharma', 'CY25B029', null),
('6', 'Rahul chahar', 'CY25B030', null),
('7', 'Shivansh Trivedi', 'CY25B031', null),
('8', 'Shresth Kausik', 'CY25B032', null),
('9', 'Subhram', 'CY25B033', null),
('10', 'Sushant Jha', 'CY25B034', null),
('11', 'Swastik Mohanty', 'CY25B035', null),
('12', 'Thanglenhao', 'CY25B036', null),
('13', 'Tulsi Kumar', 'CY25B037', null),
('14', 'Vasu Agarwal', 'CY25B038', null),
('15', 'Vivek Kumar', 'CY25B039', null),
('16', 'Kunal', 'CY25B040', null),
('17', 'Deepak Choudhary', 'CH25B039', null),
('18', 'Abhishek Kr. Singh', 'CY25B022', null),
('19', 'Adarsh Tiwari', 'CY25B023', null),
('20', 'Aditya Kumar', 'CY25B024', null),
('21', 'Himanshu Shekhar', 'PH25B022', null),
('22', 'Student 22', 'ROLL22', null),
('23', 'Student 23', 'ROLL23', null),
('24', 'Student 24', 'ROLL24', null)
ON CONFLICT (id) DO NOTHING;
