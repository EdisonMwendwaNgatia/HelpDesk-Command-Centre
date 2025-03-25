import React, { useState, useEffect } from "react";
import { getDatabase, ref, update, get } from "firebase/database";
import { useParams } from "react-router-dom";
import "../firebase/firebaseConfig";
import jsPDF from "jspdf";
import styled, { keyframes } from "styled-components";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Download,
  User,
  ArrowUpCircle,
  Zap,
  Activity,
  Repeat,
  UserPlus,
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
  font-family: "Orbitron", sans-serif;
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
  font-family: "JetBrains Mono", monospace;
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
      case "Pending":
        return "rgba(255, 186, 8, 0.2)";
      case "Assigned":
        return "rgba(32, 156, 238, 0.2)";
      case "Escalated":
        return "rgba(238, 32, 77, 0.2)";
      case "Resolved":
        return "rgba(46, 204, 113, 0.2)";
      default:
        return "rgba(255, 255, 255, 0.2)";
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case "Pending":
        return "#ffba08";
      case "Assigned":
        return "#20e4ff";
      case "Escalated":
        return "#ff5252";
      case "Resolved":
        return "#2ecc71";
      default:
        return "#ffffff";
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
  border-left: 4px solid ${(props) => props.color || "#20e4ff"};
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
  font-family: "Inter", sans-serif;

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
  background: ${(props) =>
    props.primary ? "linear-gradient(90deg, #0072ff, #00c6ff)" : "transparent"};
  color: ${(props) => (props.primary ? "#fff" : "#20e4ff")};
  border: ${(props) =>
    props.primary ? "none" : "1px solid rgba(32, 228, 255, 0.5)"};
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.primary
        ? "linear-gradient(90deg, #0072ff, #00d4ff)"
        : "rgba(32, 228, 255, 0.1)"};
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

  const technicianEmailMap = {
    2507: "ryanedinson@gmail.com",
    2508: "alice@example.com",
    2509: "bob@example.com",
  };

  const ipToEmailMap = {
    2507: "ryanedinson@gmail.com",
    2508: "alice@example.com",
    2509: "bob@example.com",
    // Add more mappings as needed
  };

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
          activityLog: ticketData.activityLog || [
            `Ticket created at ${new Date(
              ticketData.timestamp
            ).toLocaleString()}`,
          ],
        });
      }
      setLoading(false);
    };

    fetchTicket();
  }, [db, ticketId]);

  const handleUpdate = async (status) => {
    const updates = { status, timestamp: Date.now() };
    const activityLog = ticket.activityLog ? [...ticket.activityLog] : [];

    switch (status) {
      case "Assigned":
        if (assignedTechnician) {
          const technician = technicians.find(
            (t) => t.id === assignedTechnician
          );
          const technicianEmail = technicianEmailMap[assignedTechnician];

          if (technician) {
            updates.assignedTo = assignedTechnician;
            const actionMessage = `Assigned to ${
              technician.name
            } (${assignedTechnician}) at ${new Date().toLocaleString()}`;
            activityLog.push(
              `${actionMessage}${
                newAssignmentDetails ? ` (Reason: ${newAssignmentDetails})` : ""
              }`
            );
          }

          setNewAssignmentDetails("");

          // ✅ Send email to technician
          if (technicianEmail) {
            try {
              console.log(`Sending assignment email to ${technicianEmail}...`);
              const response = await fetch(
                "http://localhost:5000/api/send-assignment-email",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: technicianEmail,
                    title: ticket.title,
                    description: ticket.description,
                    department: ticket.department,
                    ipNumber: ticket.ipNumber,
                    urgency: ticket.urgency,
                  }),
                }
              );

              const responseData = await response.json();
              console.log("Assignment email API response:", responseData);

              if (!response.ok) {
                throw new Error(
                  responseData.error || "Failed to send assignment email"
                );
              }

              alert(
                `Ticket assigned successfully! Email sent to ${technicianEmail}`
              );
            } catch (error) {
              console.error("Error sending assignment email:", error);
              alert("Ticket assigned, but failed to send email notification.");
            }
          } else {
            console.warn(
              "Technician email not found, skipping email notification."
            );
          }
        }
        break;

      case "Escalated":
        if (escalationDetails) {
          updates.escalationDetails = escalationDetails;
          activityLog.push(
            `Escalated by ${
              technicians.find((t) => t.id === loggedInTechnicianId)?.name
            } at ${new Date().toLocaleString()}: ${escalationDetails}`
          );
          setEscalationDetails("");
        }
        break;

      case "Resolved":
        if (resolutionDetails) {
          updates.resolutionDetails = resolutionDetails;
          activityLog.push(
            `Resolved by ${
              technicians.find((t) => t.id === loggedInTechnicianId)?.name
            } at ${new Date().toLocaleString()}: ${resolutionDetails}`
          );
          setResolutionDetails("");

          // ✅ Determine user email from `ipNumber`
          let userEmail = ticket.ipNumber; // Assume it's an email
          if (ipToEmailMap[ticket.ipNumber]) {
            userEmail = ipToEmailMap[ticket.ipNumber]; // Map IP to email
          } else if (!/\S+@\S+\.\S+/.test(userEmail)) {
            console.warn(
              "⚠️ Invalid email format found in ipNumber. Skipping resolution email."
            );
            userEmail = null;
          }

          console.log("User email for resolution notification:", userEmail);

          // ✅ Send resolution email if valid email is found
          if (userEmail) {
            try {
              console.log(`Sending resolution email to ${userEmail}...`);
              const response = await fetch(
                "http://localhost:5000/api/send-resolution-email",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: userEmail,
                    title: ticket.title,
                    resolutionDetails,
                  }),
                }
              );

              const responseData = await response.json();
              console.log("Resolution email API response:", responseData);

              if (!response.ok) {
                throw new Error(
                  responseData.error || "Failed to send resolution email"
                );
              }

              alert(`Ticket resolved successfully! Email sent to ${userEmail}`);
            } catch (error) {
              console.error("Error sending resolution email:", error);
              alert("Ticket resolved, but failed to send email notification.");
            }
          } else {
            console.warn(
              "⚠️ User email not found in ipNumber mapping, skipping email notification."
            );
          }
        }
        break;

      default:
        console.error(`Unknown status: ${status}`);
        break;
    }

    updates.activityLog = activityLog;
    await update(ref(db, `tickets/${ticket.id}`), updates);
    setTicket((prev) => ({ ...prev, ...updates }));
  };

  const handleGenerateReport = (ticket) => {
    if (!ticket) {
      alert("Ticket not found!");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Document styling variables
    const primaryColor = [0, 114, 255];
    const secondaryColor = [0, 198, 255];
    const darkBg = [10, 25, 41];
    const lightText = [224, 247, 255];
    const subtleGray = [180, 180, 180];

    // Add background
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, 210, 297, "F");

    // Header gradient bar - smoother gradient with more steps
    for (let i = 0; i < 12; i++) {
      const ratio = i / 11;
      const r = primaryColor[0] * (1 - ratio) + secondaryColor[0] * ratio;
      const g = primaryColor[1] * (1 - ratio) + secondaryColor[1] * ratio;
      const b = primaryColor[2] * (1 - ratio) + secondaryColor[2] * ratio;
      doc.setFillColor(r, g, b);
      doc.rect(i * 17.5, 0, 17.5, 8, "F");
    }

    // Add decorative elements
    doc.setDrawColor(...secondaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, 53, 190, 53);

    // Title section
    doc.setTextColor(...primaryColor);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("COMMAND CENTER", 105, 20, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor(...secondaryColor);
    doc.text("TICKET SUPPORT REPORT", 105, 30, { align: "center" });

    // Ticket ID Badge - improved styling
    doc.setFillColor(5, 15, 30);
    doc.roundedRect(55, 35, 100, 12, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(0, 228, 255);
    doc.text(`TICKET #${ticket.id}`, 105, 43, { align: "center" });

    // Timestamp - better formatting
    doc.setFontSize(8);
    doc.setTextColor(...subtleGray);
    const timestampDate = ticket.timestamp
      ? new Date(ticket.timestamp)
      : new Date();
    const formattedDate = timestampDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = timestampDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.text(`Generated: ${formattedDate} at ${formattedTime}`, 105, 48, {
      align: "center",
    });

    // Ticket Information section with better spacing
    doc.setFontSize(14);
    doc.setTextColor(...secondaryColor);
    doc.text("TICKET INFORMATION", 30, 62);

    // Info panel with subtle gradient
    const panelY = 65;
    const panelHeight = 50;
    doc.setFillColor(5, 15, 30);
    doc.roundedRect(20, panelY, 170, panelHeight, 3, 3, "F");

    // Add subtle gradient to the panel
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    for (let i = 0; i < panelHeight; i += 2) {
      const ratio = i / panelHeight;
      doc.setFillColor(...primaryColor, 0.05 - ratio * 0.05);
      doc.rect(20, panelY + i, 170, 2, "F");
    }
    doc.setGState(new doc.GState({ opacity: 1.0 }));

    // Status Badge with improved styling
    const statusColors = {
      Pending: [255, 186, 8],
      Assigned: [32, 228, 255],
      Escalated: [255, 82, 82],
      Resolved: [46, 204, 113],
      Closed: [160, 160, 160],
    };
    const statusColor = statusColors[ticket.status] || [255, 255, 255];

    // Status badge with glow effect
    doc.setFillColor(...statusColor, 0.1);
    doc.roundedRect(145, 67, 40, 10, 5, 5, "F");
    doc.setFillColor(...statusColor, 0.2);
    doc.roundedRect(146, 68, 38, 8, 4, 4, "F");
    doc.setFontSize(9);
    doc.setTextColor(...statusColor);
    doc.setFont("helvetica", "bold");
    doc.text(ticket.status.toUpperCase(), 165, 73.5, { align: "center" });

    // Ticket Details with better layout
    doc.setFontSize(10);
    doc.setTextColor(...lightText);
    doc.setFont("helvetica", "bold");

    const leftCol = 25;
    const rightCol = 65;
    const startY = 75;
    const lineHeight = 10;

    // Left column
    doc.text("Category:", leftCol, startY);
    doc.text("Subcategory:", leftCol, startY + lineHeight);
    doc.text("Department:", leftCol, startY + lineHeight * 2);
    doc.text("Assigned to:", leftCol, startY + lineHeight * 3);

    // Right column
    doc.setFont("helvetica", "normal");
    doc.text(ticket.category || "No Category", rightCol, startY);
    doc.text(
      ticket.subcategory || "No Subcategory",
      rightCol,
      startY + lineHeight
    );
    doc.text(
      ticket.department || "No Department",
      rightCol,
      startY + lineHeight * 2
    );
    doc.text(
      ticket.assignedTo || "Unassigned",
      rightCol,
      startY + lineHeight * 3
    );

    // Activity Log Section with improved styling
    doc.setFontSize(14);
    doc.setTextColor(...secondaryColor);
    doc.text("ACTIVITY LOG", 30, 130);

    // Decorative line below section header
    doc.setDrawColor(...secondaryColor);
    doc.setLineWidth(0.3);
    doc.line(30, 133, 100, 133);

    // Activity Log Entries with better formatting
    if (ticket.activityLog && ticket.activityLog.length > 0) {
      doc.setFontSize(10);

      let yPos = 140;
      ticket.activityLog.forEach((logEntry, index) => {
        if (yPos > 270) {
          // New page when full with consistent styling
          doc.addPage();

          // Add background to new page
          doc.setFillColor(...darkBg);
          doc.rect(0, 0, 210, 297, "F");

          // Add header to new page
          doc.setTextColor(...secondaryColor);
          doc.setFontSize(14);
          doc.text("ACTIVITY LOG (CONTINUED)", 30, 15);
          doc.setLineWidth(0.3);
          doc.line(30, 18, 150, 18);

          yPos = 30;
        }

        // Timestamp extraction if logEntry contains timestamp pattern
        let timestamp = "";
        let content = logEntry;
        const timestampMatch = logEntry.match(
          /\[\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}\]/
        );

        if (timestampMatch) {
          timestamp = timestampMatch[0];
          content = logEntry.replace(timestamp, "").trim();
        }

        // Entry background for better readability
        const entryHeight = Math.ceil(doc.getTextDimensions(content).h) + 5;
        doc.setFillColor(15, 35, 60, 0.3);
        doc.roundedRect(25, yPos - 4, 160, entryHeight, 2, 2, "F");

        // Log number with accent color
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...secondaryColor);
        doc.text(`${index + 1}.`, 28, yPos);

        // Timestamp in subtle color if available
        if (timestamp) {
          doc.setFont("helvetica", "italic");
          doc.setTextColor(...subtleGray);
          doc.text(timestamp, 35, yPos);

          // Log content in normal text
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...lightText);
          const wrappedText = doc.splitTextToSize(content, 145);
          doc.text(wrappedText, 35, yPos + 5);
          yPos += wrappedText.length * 5 + 7;
        } else {
          // Log content if no timestamp
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...lightText);
          const wrappedText = doc.splitTextToSize(content, 150);
          doc.text(wrappedText, 35, yPos);
          yPos += wrappedText.length * 5 + 7;
        }
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(...lightText);
      doc.text("No activity logs available.", 25, 140);
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Footer line
      doc.setDrawColor(...primaryColor, 0.5);
      doc.setLineWidth(0.5);
      doc.line(20, 280, 190, 280);

      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(...subtleGray);
      doc.text(`Page ${i} of ${pageCount}`, 105, 286, { align: "center" });
      doc.text("Command Center - Confidential", 20, 286);
      doc.text(`Ticket #${ticket.id}`, 190, 286, { align: "right" });
    }

    // Save PDF with improved filename
    const formattedId = ticket.id.toString().padStart(6, "0");
    const fileDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    doc.save(`CC_Ticket_${formattedId}_${fileDate}.pdf`);
  };

  if (loading) {
    return (
      <Container
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Activity
            size={48}
            style={{ color: "#20e4ff", marginBottom: "1rem" }}
          />
          <p>Loading ticket data...</p>
        </div>
      </Container>
    );
  }

  if (!ticket) {
    return (
      <Container>
        <div style={{ textAlign: "center" }}>
          <AlertCircle
            size={48}
            style={{ color: "#ff5252", marginBottom: "1rem" }}
          />
          <h2>Ticket Not Found</h2>
          <p>The requested ticket could not be located in the system.</p>
        </div>
      </Container>
    );
  }

  // Check if ticket is assigned to someone else and not in Pending state
  const isAssignedToOther =
    ticket.assignedTo && ticket.assignedTo !== loggedInTechnicianId;
  const isPending = ticket.status === "Pending";

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock />;
      case "Assigned":
        return <User />;
      case "Escalated":
        return <ArrowUpCircle />;
      case "Resolved":
        return <CheckCircle />;
      default:
        return <Activity />;
    }
  };

  return (
    <Container>
      <Header>
        <FileText size={24} style={{ color: "#20e4ff" }} />
        <Title>{ticket.title}</Title>
        <TicketId>
          <Zap size={16} style={{ marginRight: "6px" }} />
          ID: {ticket.id}
        </TicketId>
      </Header>

      <GridLayout>
        <DescriptionBox>
          <h3 style={{ marginBottom: "10px", color: "#20e4ff" }}>
            Description
          </h3>
          <p>{ticket.description}</p>
        </DescriptionBox>

        <div>
          <StatusBadge status={ticket.status}>
            {getStatusIcon(ticket.status)}
            {ticket.status}
          </StatusBadge>

          {ticket.assignedTo && (
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <User size={16} style={{ color: "#20e4ff" }} />
              <span>
                Assigned to:{" "}
                {technicians.find((t) => t.id === ticket.assignedTo)?.name ||
                  ticket.assignedTo}{" "}
                <span style={{ opacity: 0.6, fontSize: "0.9rem" }}>
                  (
                  {technicians.find((t) => t.id === ticket.assignedTo)
                    ?.specialization || "unknown"}
                  )
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

          <ActionTitle style={{ marginTop: "2rem" }}>
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
        <ActionSection color="#20e4ff" style={{ textAlign: "center" }}>
          <Button
            primary
            onClick={() => handleGenerateReport(ticket)}
            style={{ margin: "0 auto" }}
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
            <ActivityLogEntry key={index}>{log}</ActivityLogEntry>
          ))}
        </div>
      </ActivityLogSection>
    </Container>
  );
};

export default TicketDetails;
