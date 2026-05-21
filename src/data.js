export const initialStudents = [
  { id: "1", name: "Kanishk Kanojia", roll: "CY25B026", room: null },
  { id: "2", name: "Mayank Rana", roll: "CY25B027", room: null },
  { id: "3", name: "Aditya Ravi Wathrey", roll: "CY25B025", room: null },
  { id: "4", name: "Nishu", roll: "CY25B013", room: null },
  { id: "5", name: "Ankit Samanta", roll: "CY25B037", room: null },
  { id: "6", name: "Vikesh Mugunth A", roll: "CY25B024", room: null },
  { id: "7", name: "Ashutosh Kumar Jha", roll: "CY25B003", room: null },
  { id: "8", name: "Aryan", roll: "CY25B017", room: null },
  { id: "9", name: "Parvesh", roll: "MD25B045", room: null },
  { id: "10", name: "Surya", roll: "MD25B028", room: null },
  { id: "11", name: "Saptarshi Deb", roll: "CY25B029", room: null },
  { id: "12", name: "Sushil Kumar", roll: "CY25B031", room: null },
  { id: "13", name: "Rajdeep Kumar", roll: "CY25B009", room: null },
  { id: "14", name: "Piyush Kumar Baranwal", roll: "CY25B021", room: null },
  { id: "15", name: "Steve Samuel Barreto", roll: "CY25B030", room: null },
  { id: "16", name: "Elaya Bharathi N", roll: "CY25B005", room: null },
  { id: "17", name: "Mohamed Shameem", roll: "CY25B020", room: null },
  { id: "18", name: "Kota Akhil Tej", roll: "CY25B007", room: null },
  { id: "19", name: "Aniketh Rajendran", roll: "CY25B033", room: null },
  { id: "20", name: "Philips Vadakekalam Bosco", roll: "CY25B014", room: null },
  { id: "21", name: "R Vaasudhevan", roll: "CY25B032", room: null },
  { id: "22", name: "Shubham", roll: "NA25B071", room: null },
  { id: "23", name: "Advait Sreekanth", roll: "CY25B001", room: null },
  { id: "24", name: "Student 24", roll: "Edit Me", room: null }
];

export const initialRooms = Array.from({ length: 12 }, (_, i) => ({
  id: `room-${i + 1}`,
  name: `Room ${i + 1}`,
  capacity: 2
}));
