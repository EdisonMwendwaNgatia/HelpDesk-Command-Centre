import React, { useState, useEffect } from "react";
import { getDatabase, ref, update, get } from "firebase/database";
import { useParams } from "react-router-dom";
import "../firebase/firebaseConfig";
import jsPDF from "jspdf";
import styled, { keyframes } from "styled-components";
import { 
  AlertCircle, CheckCircle, Clock, FileText, Download, 
  User, ArrowUpCircle, Zap, Activity, Repeat, UserPlus
} from "react-feather";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(32, 156, 238, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(32, 156, 238, 0); }
  100% { box-shadow: 0 0 0 0 rgba(32, 156, 238, 0); }
`;

const glow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled Components
const Container = styled.div`
  background-color: #0a1929;
  color: #e0f7ff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  margin: 2rem auto;
  max-width: 90%;
  animation: ${fadeIn} 0.5s ease-out;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #00c6ff, #0072ff, #7a00ff, #00c6ff);
    background-size: 300% 100%;
    animation: ${glow} 10s linear infinite;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
`;

const Title = styled.h1`
  font-family: 'Orbitron', sans-serif;
  background: linear-gradient(90deg, #00c6ff, #0072ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
  margin-left: 1rem;
`;

const TicketId = styled.div`
  background: rgba(32, 156, 238, 0.2);
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  color: #20e4ff;
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const StatusBadge = styled.div`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  margin: 1rem 0;
  animation: ${pulse} 2s infinite;
  background-color: ${({ status }) => {
    switch (status) {
      case "Pending": return "rgba(255, 186, 8, 0.2)";
      case "Assigned": return "rgba(32, 156, 238, 0.2)";
      case "Escalated": return "rgba(238, 32, 77, 0.2)";
      case "Resolved": return "rgba(46, 204, 113, 0.2)";
      default: return "rgba(255, 255, 255, 0.2)";
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case "Pending": return "#ffba08";
      case "Assigned": return "#20e4ff";
      case "Escalated": return "#ff5252";
      case "Resolved": return "#2ecc71";
      default: return "#ffffff";
    }
  }};
`;

const DescriptionBox = styled.div`
  background: rgba(10, 25, 41, 0.6);
  border: 1px solid rgba(32, 228, 255, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  backdrop-filter: blur(10px);
`;

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ActionSection = styled.div`
  background: rgba(5, 15, 30, 0.7);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-left: 4px solid ${props => props.color || "#20e4ff"};
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
  }
`;

const ActionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 1rem;
  color: #e0f7ff;
`;

const SelectDropdown = styled.select`
  background: rgba(10, 25, 41, 0.6);
  border: 1px solid rgba(32, 228, 255, 0.3);
  color: #e0f7ff;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  width: 100%;
  margin-bottom: 1rem;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2320e4ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  
  &:focus {
    outline: none;
    border-color: rgba(32, 228, 255, 0.8);
    box-shadow: 0 0 0 2px rgba(32, 228, 255, 0.2);
  }
`;

const TextArea = styled.textarea`
  background: rgba(10, 25, 41, 0.6);
  border: 1px solid rgba(32, 228, 255, 0.3);
  color: #e0f7ff;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  width: 100%;
  min-height: 100px;
  margin-bottom: 1rem;
  resize: vertical;
  font-family: 'Inter', sans-serif;
  
  &:focus {
    outline: none;
    border-color: rgba(32, 228, 255, 0.8);
    box-shadow: 0 0 0 2px rgba(32, 228, 255, 0.2);
  }
  
  &::placeholder {
    color: rgba(224, 247, 255, 0.4);
  }
`;

const Button = styled.button`
  background: ${props => props.primary ? "linear-gradient(90deg, #0072ff, #00c6ff)" : "transparent"};
  color: ${props => props.primary ? "#fff" : "#20e4ff"};
  border: ${props => props.primary ? "none" : "1px solid rgba(32, 228, 255, 0.5)"};
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.primary ? "linear-gradient(90deg, #0072ff, #00d4ff)" : "rgba(32, 228, 255, 0.1)"};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActivityLogSection = styled.div`
  background: rgba(5, 15, 30, 0.7);
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin-top: 2rem;
  position: relative;
  
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(to bottom, #0072ff, #00c6ff);
    border-radius: 4px 0 0 4px;
  }
`;

const ActivityLogHeader = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 1.5rem;
  color: #e0f7ff;
`;

const ActivityLogEntry = styled.div`
  padding: 0.75rem 1rem;
  border-left: 3px solid transparent;
  position: relative;
  margin-left: 1rem;
  font-size: 0.9rem;
  color: #e0f7ff;
  background: rgba(10, 25, 41, 0.4);
  border-radius: 0 6px 6px 0;
  margin-bottom: 1rem;
  animation: ${fadeIn} 0.3s ease-out;
  
  &::before {
    content: "";
    position: absolute;
    left: -13px;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #20e4ff;
    border: 2px solid #0a1929;
  }

  &::after {
    content: "";
    position: absolute;
    left: -9px;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: rgba(32, 228, 255, 0.3);
    z-index: -1;
  }
  
  &:last-child::after {
    display: none;
  }
`;

const TicketDetails = ({ generateReport, loggedInTechnicianId }) => {
  const { ticketId } = useParams();
  const db = getDatabase();
  const [ticket, setTicket] = useState(null);
  const [resolutionDetails, setResolutionDetails] = useState("");
  const [assignedTechnician, setAssignedTechnician] = useState("");
  const [escalationDetails, setEscalationDetails] = useState("");
  const [newAssignmentDetails, setNewAssignmentDetails] = useState("");
  const [loading, setLoading] = useState(true);

  // Hardcoded technicians
  const [technicians] = useState([
    { id: "2507", name: "David", ipPhone: "2507", specialization: "hardware" },
    { id: "2508", name: "Alice", ipPhone: "2508", specialization: "software" },
    { id: "2509", name: "Bob", ipPhone: "2509", specialization: "network" },
  ]);

  useEffect(() => {
    if (!ticketId) return;

    const fetchTicket = async () => {
      setLoading(true);
      const snapshot = await get(ref(db, `tickets/${ticketId}`));
      if (snapshot.exists()) {
        const ticketData = snapshot.val();
        setTicket({ 
          id: ticketId, 
          ...ticketData,
          activityLog: ticketData.activityLog || [`Ticket created at ${new Date(ticketData.timestamp).toLocaleString()}`]
        });
      }
      setLoading(false);
    };

    fetchTicket();
  }, [db, ticketId]);

  const handleUpdate = (status) => {
    const updates = { status, timestamp: Date.now() };
    const activityLog = ticket.activityLog ? [...ticket.activityLog] : [];

    switch (status) {
      case "Assigned":
        if (assignedTechnician) {
          updates.assignedTo = assignedTechnician;
          const actionMessage = `Assigned to ${technicians.find(t => t.id === assignedTechnician)?.name} (${assignedTechnician}) at ${new Date().toLocaleString()}`;
          activityLog.push(
            `${actionMessage}${newAssignmentDetails ? ` (Reason: ${newAssignmentDetails})` : ""}`
          );
          setNewAssignmentDetails("");
        }
        break;

      case "Escalated":
        if (escalationDetails) {
          updates.escalationDetails = escalationDetails;
          activityLog.push(`Escalated by ${technicians.find(t => t.id === loggedInTechnicianId)?.name} at ${new Date().toLocaleString()}: ${escalationDetails}`);
          setEscalationDetails("");
        }
        break;

      case "Resolved":
        if (resolutionDetails) {
          updates.resolutionDetails = resolutionDetails;
          activityLog.push(`Resolved by ${technicians.find(t => t.id === loggedInTechnicianId)?.name} at ${new Date().toLocaleString()}: ${resolutionDetails}`);
          setResolutionDetails("");
        }
        break;

      default:
        console.error(`Unknown status: ${status}`);
        break;
    }

    updates.activityLog = activityLog;
    update(ref(db, `tickets/${ticket.id}`), updates);
    setTicket((prev) => ({ ...prev, ...updates }));
  };

  const handleGenerateReport = (ticketId) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
  
    // Document styling variables
    const primaryColor = [0, 114, 255];
    const secondaryColor = [0, 198, 255];
    const darkBg = [10, 25, 41];
    const lightText = [224, 247, 255];
    
    // Add background
    doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
    doc.rect(0, 0, 210, 297, 'F');
    
    // Add header gradient bar
    const addGradientHeader = () => {
      for (let i = 0; i < 6; i++) {
        const ratio = i / 5;
        const r = primaryColor[0] * (1 - ratio) + secondaryColor[0] * ratio;
        const g = primaryColor[1] * (1 - ratio) + secondaryColor[1] * ratio;
        const b = primaryColor[2] * (1 - ratio) + secondaryColor[2] * ratio;
        doc.setFillColor(r, g, b);
        doc.rect(i * 35, 0, 35, 8, 'F');
      }
    };
    addGradientHeader();

    // Add icons using custom drawIcon function
    const drawIcon = (iconType, x, y, size = 5) => {
      doc.setDrawColor(lightText[0], lightText[1], lightText[2]);
      doc.setLineWidth(0.2);
    };
    
    // Add company logo/title with icon
    doc.setFillColor(lightText[0], lightText[1], lightText[2]);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    drawIcon('info', 70, 12, 8);
    doc.text("COMMAND CENTER", 105, 20, { align: "center" });
    
    // Add report title with ticket icon
    doc.setFontSize(18);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    drawIcon('ticket', 70, 22, 8);
    doc.text("TICKET SUPPORT REPORT", 105, 30, { align: "center" });
    
    // Add ticket ID badge
    doc.setFillColor(5, 15, 30);
    doc.roundedRect(65, 35, 80, 10, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(0, 228, 255);
    doc.text(`TICKET #${ticket.id}`, 105, 42, { align: "center" });
    
    // Add timestamp with clock icon
    drawIcon('clock', 85, 43, 4);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 48, { align: "center" });
    
    // Add ticket details section
    doc.setDrawColor(32, 228, 255);
    doc.setLineWidth(0.5);
    doc.line(20, 55, 190, 55);
    
    doc.setFontSize(14);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    drawIcon('info', 20, 57, 6);
    doc.text("TICKET INFORMATION", 30, 62);
    
    // Add ticket details in a stylized box
    doc.setFillColor(5, 15, 30);
    doc.roundedRect(20, 65, 170, 50, 2, 2, 'F');
    
    // Status badge with enhanced styling
    const getStatusColor = (status) => {
      switch(status) {
        case "Pending": return [255, 186, 8];
        case "Assigned": return [32, 228, 255];
        case "Escalated": return [255, 82, 82];
        case "Resolved": return [46, 204, 113];
        default: return [255, 255, 255];
      }
    };
    
    const statusColor = getStatusColor(ticket.status);
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2], 0.2);
    doc.roundedRect(150, 67, 35, 8, 4, 4, 'F');
    doc.setFontSize(8);
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(ticket.status.toUpperCase(), 167.5, 72.5, { align: "center" });
    
    // Add ticket details with icons
    doc.setFontSize(10);
    doc.setTextColor(lightText[0], lightText[1], lightText[2]);
    
    // Detail labels with icons
    doc.setFont("helvetica", "bold");
    drawIcon('ticket', 20, 72, 4);
    doc.text("Title:", 25, 75);
    doc.text("Description:", 25, 85);
    drawIcon('user', 20, 102, 4);
    doc.text("Assigned to:", 25, 105);
    
    // Detail values
    doc.setFont("helvetica", "normal");
    doc.text(ticket.title, 55, 75);
    
    // Handle multi-line description with proper wrapping
    const splitDescription = doc.splitTextToSize(ticket.description, 130);
    doc.text(splitDescription, 55, 85);
    
    // Add assigned technician info
    if (ticket.assignedTo) {
      const techInfo = technicians.find(t => t.id === ticket.assignedTo);
      if (techInfo) {
        doc.text(`${techInfo.name} (${techInfo.specialization})`, 55, 105);
      } else {
        doc.text(ticket.assignedTo, 55, 105);
      }
    } else {
      doc.text("Unassigned", 55, 105);
    }
    
    // Activity log section with improved spacing
    doc.setFontSize(14);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    drawIcon('clock', 20, 125, 6);
    doc.text("ACTIVITY LOG", 30, 130);
    
    // Calculate available space for activity log
    const availableHeight = 260 - 135; // Space between activity log start and footer
    const entryHeight = 15; // Height per entry
    const maxEntries = Math.floor(availableHeight / entryHeight);
    
    // Handle pagination if needed
    const timelineStartY = 135;
    const timelineX = 25;
    
    const drawActivityLog = (entries, startIndex) => {
      entries.forEach((log, index) => {
        const entryY = timelineStartY + (index * entryHeight);
        
        // Draw timeline
        doc.setDrawColor(32, 228, 255, 0.4);
        doc.setLineWidth(0.5);
        doc.line(timelineX, entryY, timelineX, entryY + entryHeight);
        
        // Draw node
        doc.setFillColor(32, 228, 255);
        doc.circle(timelineX, entryY, 1.5, 'F');
        
        // Entry background
        if (index % 2 === 0) {
          doc.setFillColor(5, 15, 30);
          doc.roundedRect(timelineX + 5, entryY - 4, 165, 8, 1, 1, 'F');
        }
        
        // Entry text with color coding
        let textColor = [224, 247, 255];
        if (log.includes("Assigned to")) textColor = [32, 228, 255];
        else if (log.includes("Escalated")) textColor = [255, 82, 82];
        else if (log.includes("Resolved")) textColor = [46, 204, 113];
        else if (log.includes("created")) textColor = [255, 186, 8];
        
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(9);
        
        // Wrap long log entries
        const logText = `${startIndex + index + 1}. ${log}`;
        const splitLog = doc.splitTextToSize(logText, 155);
        doc.text(splitLog, timelineX + 8, entryY);
      });
    };
    
    // Split activity log into pages if needed
    const totalPages = Math.ceil(ticket.activityLog.length / maxEntries);
    
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        doc.addPage();
        addGradientHeader();
        doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
        doc.rect(0, 8, 210, 297, 'F');
      }
      
      const startIndex = page * maxEntries;
      const endIndex = Math.min((page + 1) * maxEntries, ticket.activityLog.length);
      const pageEntries = ticket.activityLog.slice(startIndex, endIndex);
      
      drawActivityLog(pageEntries, startIndex);
      
      // Add footer
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(0.8);
      doc.line(20, 270, 190, 270);
      
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("CONFIDENTIAL - INTERNAL USE ONLY", 105, 277, { align: "center" });
      doc.text(`Support Command Center • Page ${page + 1} of ${totalPages}`, 105, 282, { align: "center" });
      
      // Tech pattern
      const drawTechPattern = () => {
        doc.setDrawColor(20, 228, 255, 0.2);
        doc.setLineWidth(0.2);
        for (let i = 0; i < 8; i++) {
          doc.line(160 + i*4, 290, 180 + i*2, 270);
        }
      };
      drawTechPattern();
    }
    
    // Save the PDF
    doc.save(`ticket_${ticket.id}_report.pdf`);
};

  if (loading) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Activity size={48} style={{ color: '#20e4ff', marginBottom: '1rem' }} />
          <p>Loading ticket data...</p>
        </div>
      </Container>
    );
  }

  if (!ticket) {
    return (
      <Container>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: '#ff5252', marginBottom: '1rem' }} />
          <h2>Ticket Not Found</h2>
          <p>The requested ticket could not be located in the system.</p>
        </div>
      </Container>
    );
  }

  // Check if ticket is assigned to someone else and not in Pending state
  const isAssignedToOther = ticket.assignedTo && ticket.assignedTo !== loggedInTechnicianId;
  const isPending = ticket.status === "Pending";

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return <Clock />;
      case "Assigned": return <User />;
      case "Escalated": return <ArrowUpCircle />;
      case "Resolved": return <CheckCircle />;
      default: return <Activity />;
    }
  };

  return (
    <Container>
      <Header>
        <FileText size={24} style={{ color: '#20e4ff' }} />
        <Title>{ticket.title}</Title>
        <TicketId>
          <Zap size={16} style={{ marginRight: '6px' }} />
          ID: {ticket.id}
        </TicketId>
      </Header>

      <GridLayout>
        <DescriptionBox>
          <h3 style={{ marginBottom: '10px', color: '#20e4ff' }}>Description</h3>
          <p>{ticket.description}</p>
        </DescriptionBox>
        
        <div>
          <StatusBadge status={ticket.status}>
            {getStatusIcon(ticket.status)}
            {ticket.status}
          </StatusBadge>
          
          {ticket.assignedTo && (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} style={{ color: '#20e4ff' }} />
              <span>
                Assigned to: {technicians.find(t => t.id === ticket.assignedTo)?.name || ticket.assignedTo}
                {" "}
                <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>
                  ({technicians.find(t => t.id === ticket.assignedTo)?.specialization || "unknown"})
                </span>
              </span>
            </div>
          )}
        </div>
      </GridLayout>

      {ticket.status === "Pending" && (
        <ActionSection color="#ffba08">
          <ActionTitle>
            <UserPlus size={18} />
            Assign Ticket
          </ActionTitle>
          
          <SelectDropdown
            value={assignedTechnician}
            onChange={(e) => setAssignedTechnician(e.target.value)}
          >
            <option value="">Select Technician</option>
            {technicians.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.name} ({tech.specialization} - {tech.ipPhone})
              </option>
            ))}
          </SelectDropdown>
          
          <Button 
            primary
            onClick={() => handleUpdate("Assigned")}
            disabled={!assignedTechnician}
          >
            <User size={16} />
            Assign Ticket
          </Button>
          
          <ActionTitle style={{ marginTop: '2rem' }}>
            <ArrowUpCircle size={18} />
            Escalate Ticket
          </ActionTitle>
          
          <TextArea
            placeholder="Escalation details..."
            value={escalationDetails}
            onChange={(e) => setEscalationDetails(e.target.value)}
          />
          
          <Button
            onClick={() => handleUpdate("Escalated")}
            disabled={!escalationDetails}
          >
            <ArrowUpCircle size={16} />
            Escalate
          </Button>
        </ActionSection>
      )}

      {ticket.status === "Assigned" && (
        <GridLayout>
          {!isAssignedToOther && (
            <ActionSection color="#20e4ff">
              <ActionTitle>
                <Repeat size={18} />
                Reassign Ticket
              </ActionTitle>
              
              <SelectDropdown 
                onChange={(e) => setAssignedTechnician(e.target.value)}
              >
                <option value="">Select New Technician</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name} ({tech.specialization} - {tech.ipPhone})
                  </option>
                ))}
              </SelectDropdown>
              
              <TextArea
                placeholder="Reason for reassignment..."
                value={newAssignmentDetails}
                onChange={(e) => setNewAssignmentDetails(e.target.value)}
              />
              
              <Button
                onClick={() => handleUpdate("Assigned")}
                disabled={!assignedTechnician}
              >
                <Repeat size={16} />
                Reassign
              </Button>
            </ActionSection>
          )}

          {(isAssignedToOther || isPending) && (
            <ActionSection color="#ff5252">
              <ActionTitle>
                <ArrowUpCircle size={18} />
                Escalate Ticket
              </ActionTitle>
              
              <TextArea
                placeholder="Escalation details..."
                value={escalationDetails}
                onChange={(e) => setEscalationDetails(e.target.value)}
              />
              
              <Button
                onClick={() => handleUpdate("Escalated")}
                disabled={!escalationDetails}
              >
                <ArrowUpCircle size={16} />
                Escalate
              </Button>
            </ActionSection>
          )}

          <ActionSection color="#2ecc71">
            <ActionTitle>
              <CheckCircle size={18} />
              Resolve Ticket
            </ActionTitle>
            
            <TextArea
              placeholder="Resolution details..."
              value={resolutionDetails}
              onChange={(e) => setResolutionDetails(e.target.value)}
            />
            
            <Button
              primary
              onClick={() => handleUpdate("Resolved")}
              disabled={!resolutionDetails}
            >
              <CheckCircle size={16} />
              Resolve
            </Button>
          </ActionSection>

          <ActionSection color="#20e4ff">
              <ActionTitle>
                <Repeat size={18} />
                Reassign Ticket
              </ActionTitle>
              
              <SelectDropdown 
                onChange={(e) => setAssignedTechnician(e.target.value)}
              >
                <option value="">Select New Technician</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name} ({tech.specialization} - {tech.ipPhone})
                  </option>
                ))}
              </SelectDropdown>
              
              <TextArea
                placeholder="Reason for reassignment..."
                value={newAssignmentDetails}
                onChange={(e) => setNewAssignmentDetails(e.target.value)}
              />
              
              <Button
                onClick={() => handleUpdate("Assigned")}
                disabled={!assignedTechnician}
              >
                <Repeat size={16} />
                Reassign
              </Button>
            </ActionSection>

        </GridLayout>
      )}

      {ticket.status === "Escalated" && (
        <ActionSection color="#2ecc71">
          <ActionTitle>
            <CheckCircle size={18} />
            Resolve Ticket
          </ActionTitle>
          
          <TextArea
            placeholder="Resolution details..."
            value={resolutionDetails}
            onChange={(e) => setResolutionDetails(e.target.value)}
          />
          
          <Button
            primary
            onClick={() => handleUpdate("Resolved")}
            disabled={!resolutionDetails}
          >
            <CheckCircle size={16} />
            Resolve
          </Button>
        </ActionSection>
      )}

      {ticket.status === "Resolved" && (
        <ActionSection color="#20e4ff" style={{ textAlign: 'center' }}>
          <Button 
            primary
            onClick={() => handleGenerateReport(ticket.id)}
            style={{ margin: '0 auto' }}
          >
            <Download size={16} />
            Generate Report
          </Button>
        </ActionSection>
      )}

      <ActivityLogSection>
        <ActivityLogHeader>
          <Activity size={18} />
          Ticket Activity Log
        </ActivityLogHeader>
        
        <div>
          {ticket.activityLog?.map((log, index) => (
            <ActivityLogEntry key={index}>
              {log}
            </ActivityLogEntry>
          ))}
        </div>
      </ActivityLogSection>
    </Container>
  );
};

export default TicketDetails;