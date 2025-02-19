import { ref, set } from "firebase/database";
import { db } from "./firebaseConfig";

const addTechnicians = () => {
  const technicians = [
    { id: "tech1", name: "John Doe", ipPhone: "1001" },
    { id: "tech2", name: "Jane Smith", ipPhone: "1002" },
    { id: "tech3", name: "Alice Johnson", ipPhone: "1003" },
    { id: "tech4", name: "Bob Williams", ipPhone: "1004" }
  ];

  technicians.forEach((tech) => {
    set(ref(db, `technicians/${tech.id}`), tech)
      .then(() => console.log(`Technician ${tech.name} added`))
      .catch((error) => console.error("Error adding technician:", error));
  });
};

// Call the function to insert technicians (Run this only once)
addTechnicians();
