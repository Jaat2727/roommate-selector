-- 1. Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 2
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations for anon on rooms'
  ) THEN
    CREATE POLICY "Allow all operations for anon on rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
  END IF;
END
$$;

-- Initialize rooms
INSERT INTO rooms (id, name, capacity) VALUES 
('room-1', 'Room 1', 2),
('room-2', 'Room 2', 2),
('room-3', 'Room 3', 2),
('room-4', 'Room 4', 2),
('room-5', 'Room 5', 2),
('room-6', 'Room 6', 2),
('room-7', 'Room 7', 2),
('room-8', 'Room 8', 2),
('room-9', 'Room 9', 2),
('room-10', 'Room 10', 2),
('room-11', 'Room 11', 2),
('room-12', 'Room 12', 2)
ON CONFLICT (id) DO NOTHING;

-- 2. Clear old students and insert new ones
TRUNCATE TABLE students;

INSERT INTO students (id, name, roll, room) VALUES 
('1', 'Kanishk Kanojia', 'CY25B026', null),
('2', 'Mayank Rana', 'CY25B027', null),
('3', 'Aditya Ravi Wathrey', 'CY25B025', null),
('4', 'Nishu', 'CY25B013', null),
('5', 'Ankit Samanta', 'CY25B037', null),
('6', 'Vikesh Mugunth A', 'CY25B024', null),
('7', 'Ashutosh Kumar Jha', 'CY25B003', null),
('8', 'Aryan', 'CY25B017', null),
('9', 'Parvesh', 'MD25B045', null),
('10', 'Surya', 'MD25B028', null),
('11', 'Saptarshi Deb', 'CY25B029', null),
('12', 'Sushil Kumar', 'CY25B031', null),
('13', 'Rajdeep Kumar', 'CY25B009', null),
('14', 'Piyush Kumar Baranwal', 'CY25B021', null),
('15', 'Steve Samuel Barreto', 'CY25B030', null),
('16', 'Elaya Bharathi N', 'CY25B005', null),
('17', 'Mohamed Shameem', 'CY25B020', null),
('18', 'Kota Akhil Tej', 'CY25B007', null),
('19', 'Aniketh Rajendran', 'CY25B033', null),
('20', 'R Vaasudhevan', 'CY25B032', null),
('21', 'Shubham', 'NA25B071', null),
('22', 'Advait Sreekanth', 'CY25B001', null);
