import React, { useState, useEffect } from "react";
import { getDatabase, ref, get, push, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import "../firebase/firebaseConfig";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Global Styles
const GlobalStyle = createGlobalStyle`
  :root {
    --primary: #6e44ff;
    --secondary: #00c2ff;
    --dark: #0f1631;
    --light: #e6f8ff;
    --success: #00f7b5;
    --warning: #ff7e50;
    --danger: #ff4486;
    --card-bg: rgba(14, 21, 58, 0.8);
    --glass: rgba(255, 255, 255, 0.1);
  }

  body {
    margin: 0;
    background: linear-gradient(135deg, var(--dark), #070b1a);
    color: var(--light);
    font-family: 'Inter', sans-serif;
    overflow-x: hidden;
  }
`;

// Animations
const glow = keyframes`
  0% { box-shadow: 0 0 5px var(--primary), 0 0 10px var(--primary); }
  50% { box-shadow: 0 0 20px var(--primary), 0 0 30px var(--secondary); }
  100% { box-shadow: 0 0 5px var(--primary), 0 0 10px var(--primary); }
`;

const pulseBackground = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const slideIn = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Styled Components
const DashboardContainer = styled.div`
  padding: 32px;
  max-width: 1600px;
  margin: 0 auto;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 800;
  background: linear-gradient(to right, var(--secondary), var(--primary));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -8px;
    height: 4px;
    width: 60px;
    background: linear-gradient(to right, var(--secondary), var(--primary));
    border-radius: 4px;
  }
`;

const FormSection = styled.div`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 40px;
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass);
  animation: ${slideIn} 0.5s ease-out;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--light);
  padding: 12px 16px;
  font-size: 14px;
  transition: all 0.3s ease;
  outline: none;
  width: 100%;

  &:focus {
    border-color: var(--secondary);
    box-shadow: 0 0 0 2px rgba(0, 194, 255, 0.25);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--light);
  padding: 12px 16px;
  font-size: 14px;
  transition: all 0.3s ease;
  outline: none;
  width: 100%;
  appearance: none; /* Removes default styling */

  /* Custom dropdown arrow */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255, 255, 255, 0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;

  &:focus {
    border-color: var(--secondary);
    box-shadow: 0 0 0 2px rgba(0, 194, 255, 0.25);
  }

  /* Styling for the options */
  option {
    background: #1a1a1a; /* Dark background for options */
    color: var(--light);
    padding: 12px;
  }
`;

const Button = styled.button`
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  background-size: 200% 200%;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${pulseBackground} 3s infinite;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 30px;
  width: 100%;
  max-width: 600px;
`;

const SearchInput = styled(Input)`
  padding-left: 40px;
  width: 100%;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.4);
`;

const ColumnsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 20px;
`;

const StatusColumn = styled.div`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  min-height: 400px;
  border: 1px solid var(--glass);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  animation: ${slideIn} 0.5s ease-out;
  animation-delay: ${(props) => props.index * 0.1}s;
  animation-fill-mode: both;
`;

const ColumnHeader = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: "";
    display: block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${(props) => {
      switch (props.status) {
        case "Pending":
          return "var(--warning)";
        case "Assigned":
          return "var(--secondary)";
        case "Escalated":
          return "var(--danger)";
        case "Resolved":
          return "var(--success)";
        default:
          return "var(--primary)";
      }
    }};
  }
`;

const TicketList = styled.div`
  overflow-y: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TicketCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  border-left: 3px solid
    ${(props) => {
      switch (props.status) {
        case "Pending":
          return "var(--warning)";
        case "Assigned":
          return "var(--secondary)";
        case "Escalated":
          return "var(--danger)";
        case "Resolved":
          return "var(--success)";
        default:
          return "var(--primary)";
      }
    }};
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.07);
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 30px;
    height: 30px;
    background: linear-gradient(
      135deg,
      transparent 50%,
      ${(props) => {
          switch (props.status) {
            case "Pending":
              return "var(--warning)";
            case "Assigned":
              return "var(--secondary)";
            case "Escalated":
              return "var(--danger)";
            case "Resolved":
              return "var(--success)";
            default:
              return "var(--primary)";
          }
        }}
        50%
    );
    border-bottom-left-radius: 8px;
  }
`;

const TicketTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
`;

const TicketDescription = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
`;

const TicketMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`;

const MetaTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 12px;
`;

const PulseIcon = styled.span`
  position: relative;
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 5px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: ${(props) => props.color || "var(--primary)"};
    border-radius: 50%;
    animation: ${glow} 2s infinite;
  }
`;

// Icons component
const Icons = {
  Search: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 21L16.65 16.65"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Calendar: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 2V6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 2V6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 10H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Building: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 21H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Globe: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12H22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  User: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Add: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 5V19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 12H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

//add departments here

const departments = [
  "Finance",
  "Procurement",
  "Risk Assessment",
  "IT Support",
  "Human Resources",
  "Operations",
];

const Dashboard = () => {
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    department: "",
    ipNumber: "",
  });
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const db = getDatabase();

  useEffect(() => {
    if (!localStorage.getItem("isAuthenticated")) {
      navigate("/"); // Redirect to the login page if not authenticated
    }
  }, [navigate]);

  useEffect(() => {
    const ticketsRef = ref(db, "tickets");
    onValue(ticketsRef, (snapshot) => {
      const data = snapshot.val();
      const ticketsArray = data
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        : [];
      setTickets(ticketsArray);
    });
  }, [db]);

  // IP-to-Email Mapping
const ipToEmailMap = {
  "2507": "linah@yahoo.co.ke",
  "2399": "cindy@gmail.com",
  // Add more mappings as needed
};

// Helper function to validate email format
const isEmail = (input) => /\S+@\S+\.\S+/.test(input);

const handleAddTicket = async () => {
  if (
    newTicket.title &&
    newTicket.description &&
    newTicket.department &&
    newTicket.ipNumber
  ) {
    try {
      console.log("Creating a new ticket with details:", newTicket);
      let recipientEmail = newTicket.ipNumber;

      // Check if the input is an IP number and map it to an email
      if (ipToEmailMap[newTicket.ipNumber]) {
        recipientEmail = ipToEmailMap[newTicket.ipNumber]; // Get mapped email
      } else if (!isEmail(newTicket.ipNumber)) {
        throw new Error("Invalid IP Number or Email");
      }

      console.log("Final recipient email:", recipientEmail);

      // Push ticket to Firebase
      console.log("Pushing ticket to Firebase...");
      await push(ref(db, "tickets"), {
        title: newTicket.title,
        description: newTicket.description,
        department: newTicket.department,
        ipNumber: newTicket.ipNumber, // Store IP or Email
        status: "Pending",
        timestamp: Date.now(),
      });
      console.log("Ticket successfully stored in Firebase");

      // Clear form
      setNewTicket({
        title: "",
        description: "",
        department: "",
        ipNumber: "",
      });

      // Send email notification
      console.log("Sending email request to backend...");
      const response = await fetch("http://localhost:5000/api/send-confirmation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: recipientEmail,
          title: newTicket.title,
          description: newTicket.description,
        }),
      });

      console.log("Email API response status:", response.status);
      const responseData = await response.json();
      console.log("Email API response data:", responseData);
      
      if (!response.ok) throw new Error("Failed to send confirmation email");

      alert(`Ticket created successfully! Email sent to ${recipientEmail}`);
    } catch (error) {
      console.error("Error in handleAddTicket:", error);
      alert(`Error: ${error.message}`);
    }
  } else {
    alert("Please fill in all fields: Title, Description, Department, and IP Number.");
  }
};


const handleDownloadTickets = async () => {
  try {
    const snapshot = await get(ref(db, "tickets"));

    if (!snapshot.exists()) {
      alert("No tickets found");
      return;
    }

    const tickets = snapshot.val();
    const ticketArray = Object.keys(tickets).map((key) => ({
      ipNumber: tickets[key].ipNumber,
      problem: tickets[key].title,
      description: tickets[key].description,
      status: tickets[key].status,
    }));

    // Group tickets by status
    const groupedTickets = ticketArray.reduce((acc, ticket) => {
      acc[ticket.status] = acc[ticket.status] || [];
      acc[ticket.status].push(ticket);
      return acc;
    }, {});

    // Generate PDF
    generatePDF(groupedTickets);
  } catch (error) {
    alert("Error fetching tickets: " + error.message);
  }
};

const generatePDF = (data) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Tickets Report", 14, 15);

  let yPos = 25;

  Object.keys(data).forEach((status) => {
    doc.setFontSize(14);
    doc.text(`Status: ${status}`, 14, yPos);
    yPos += 6;

    const tableData = data[status].map((ticket) => [
      ticket.ipNumber,
      ticket.problem,
      ticket.description,
    ]);

    doc.autoTable({
      startY: yPos,
      head: [["IP Phone", "Problem", "Description"]],
      body: tableData,
      theme: "grid",
    });

    yPos = doc.autoTable.previous.finalY + 10;
  });

  doc.save("tickets_report.pdf");
};




  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <>
      <GlobalStyle />
      <DashboardContainer>
        <Header>
          <Title>Helpdesk Command Center</Title>
          <Button onClick={handleDownloadTickets}>
            Download Tickets as PDF</Button>
        </Header>

        <FormSection>
          <TicketTitle>Create New Support Ticket</TicketTitle>
          <FormGrid>
            <Input
              type="text"
              placeholder="Ticket Title"
              value={newTicket.title}
              onChange={(e) =>
                setNewTicket({ ...newTicket, title: e.target.value })
              }
            />
            <Input
              type="text"
              placeholder="Description"
              value={newTicket.description}
              onChange={(e) =>
                setNewTicket({ ...newTicket, description: e.target.value })
              }
            />
            <Select
              value={newTicket.department}
              onChange={(e) =>
                setNewTicket({ ...newTicket, department: e.target.value })
              }
            >
              <option value="" disabled>
                Select Department
              </option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </Select>
            <Input
              type="text"
              placeholder="IP Number"
              value={newTicket.ipNumber}
              onChange={(e) =>
                setNewTicket({ ...newTicket, ipNumber: e.target.value })
              }
            />
          </FormGrid>
          <Button onClick={handleAddTicket}>
            <Icons.Add /> Create Ticket
          </Button>
        </FormSection>

        <SearchBar>
          <SearchIcon>
            <Icons.Search />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search tickets by title, description, department or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />
        </SearchBar>

        <ColumnsContainer>
          {["Pending", "Assigned", "Escalated", "Resolved"].map(
            (status, index) => (
              <StatusColumn key={status} index={index}>
                <ColumnHeader status={status}>{status}</ColumnHeader>
                <TicketList>
                  {tickets
                    .filter((ticket) => {
                      const matchesSearch =
                        (ticket.title &&
                          ticket.title.toLowerCase().includes(searchTerm)) ||
                        (ticket.description &&
                          ticket.description
                            .toLowerCase()
                            .includes(searchTerm)) ||
                        (ticket.department &&
                          ticket.department
                            .toLowerCase()
                            .includes(searchTerm)) ||
                        (ticket.ipNumber &&
                          ticket.ipNumber.toLowerCase().includes(searchTerm));

                      return ticket.status === status && matchesSearch;
                    })
                    .map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        status={status}
                        onClick={() => navigate(`/ticket/${ticket.id}`)}
                      >
                        <TicketTitle>{ticket.title}</TicketTitle>
                        <TicketDescription>
                          {ticket.description}
                        </TicketDescription>
                        <TicketMeta>
                          <MetaTag>
                            <Icons.Building />
                            {ticket.department}
                          </MetaTag>
                          <MetaTag>
                            <Icons.Globe />
                            {ticket.ipNumber}
                          </MetaTag>
                          {ticket.assignedTo && (
                            <MetaTag>
                              <Icons.User />
                              {ticket.assignedTo}
                            </MetaTag>
                          )}
                          <MetaTag>
                            <Icons.Calendar />
                            {formatTimestamp(ticket.timestamp)}
                          </MetaTag>
                          <MetaTag>
                            <PulseIcon
                              color={
                                status === "Pending"
                                  ? "var(--warning)"
                                  : status === "Assigned"
                                  ? "var(--secondary)"
                                  : status === "Escalated"
                                  ? "var(--danger)"
                                  : "var(--success)"
                              }
                            />
                            {status}
                          </MetaTag>
                        </TicketMeta>
                      </TicketCard>
                    ))}
                </TicketList>
              </StatusColumn>
            )
          )}
        </ColumnsContainer>
      </DashboardContainer>
    </>
  );
};

export default Dashboard;
