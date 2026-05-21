import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres.acfigyizdvxjuqlfywuk:Roommate2026!Secure@aws-0-ap-south-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      roll TEXT NOT NULL,
      room TEXT
    );
    
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
  `);
  
  const res = await client.query('SELECT count(*) FROM students');
  if (parseInt(res.rows[0].count) === 0) {
    const initialStudents = [
      { id: '1', name: 'Kanishk Kanojia', roll: 'CY25B026' },
      { id: '2', name: 'Mayank Rana', roll: 'CY25B027' },
      { id: '3', name: 'Aditya Ravi Wathrey', roll: 'CY25B025' },
      { id: '4', name: 'Pranjal', roll: 'CY25B028' },
      { id: '5', name: 'Puru Sharma', roll: 'CY25B029' },
      { id: '6', name: 'Rahul chahar', roll: 'CY25B030' },
      { id: '7', name: 'Shivansh Trivedi', roll: 'CY25B031' },
      { id: '8', name: 'Shresth Kausik', roll: 'CY25B032' },
      { id: '9', name: 'Subhram', roll: 'CY25B033' },
      { id: '10', name: 'Sushant Jha', roll: 'CY25B034' },
      { id: '11', name: 'Swastik Mohanty', roll: 'CY25B035' },
      { id: '12', name: 'Thanglenhao', roll: 'CY25B036' },
      { id: '13', name: 'Tulsi Kumar', roll: 'CY25B037' },
      { id: '14', name: 'Vasu Agarwal', roll: 'CY25B038' },
      { id: '15', name: 'Vivek Kumar', roll: 'CY25B039' },
      { id: '16', name: 'Kunal', roll: 'CY25B040' },
      { id: '17', name: 'Deepak Choudhary', roll: 'CH25B039' },
      { id: '18', name: 'Abhishek Kr. Singh', roll: 'CY25B022' },
      { id: '19', name: 'Adarsh Tiwari', roll: 'CY25B023' },
      { id: '20', name: 'Aditya Kumar', roll: 'CY25B024' },
      { id: '21', name: 'Himanshu Shekhar', roll: 'PH25B022' },
      { id: '22', name: 'Student 22', roll: 'ROLL22' },
      { id: '23', name: 'Student 23', roll: 'ROLL23' },
      { id: '24', name: 'Student 24', roll: 'ROLL24' }
    ];
    
    for (const student of initialStudents) {
      await client.query('INSERT INTO students (id, name, roll, room) VALUES ($1, $2, $3, null)', [student.id, student.name, student.roll]);
    }
  }
  
  console.log('Database initialized successfully');
  await client.end();
}
run().catch(console.error);
