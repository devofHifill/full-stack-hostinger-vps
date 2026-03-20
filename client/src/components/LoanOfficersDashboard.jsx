import React, { useMemo, useState } from "react";
import "./LoanOfficersDashboard.css";

const initialOfficers = [
  {
    id: 1,
    name: "Regie Ford",
    title: "Mortgage Broker & CEO",
    nmls: "1508332",
    appointmentUrl: "https://calendly.com/regieford",
    profileUrl: "https://www.sebmtg.com/regie-ford/",
  },
  {
    id: 2,
    name: "Brenda Jackson",
    title: "Loan Officer",
    nmls: "1914547",
    appointmentUrl:
      "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1Fu9bVYDMqebHBLFougw5HNrkfmWP8xaHU7k0Y9GUq_0YpkzKigEUi7wjPTpaIBaBvtWVrKAHI",
    profileUrl: "https://www.sebmtg.com/brenda-jackson/",
  },
  {
    id: 3,
    name: "David Rudolph",
    title: "Loan Officer",
    nmls: "349507",
    appointmentUrl:
      "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0YxCzgIanD0Yq6tX7Sf03P5vPxh5mpzjvM8_FXC-DE7YVwY16AUozwKtAbHEI-IctmApELi4lx",
    profileUrl: "https://www.sebmtg.com/team/david-rudolph/",
  },
];

const emptyForm = {
  id: null,
  name: "",
  title: "",
  nmls: "",
  appointmentUrl: "",
  profileUrl: "",
};

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function LoanOfficersDashboard() {
  const [officers, setOfficers] = useState(initialOfficers);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setIsEditing(false);
  };

  const handleEdit = (officer) => {
    setForm(officer);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    const ok = window.confirm("Are you sure you want to delete this loan officer?");
    if (!ok) return;

    setOfficers((prev) => prev.filter((item) => item.id !== id));

    if (form.id === id) {
      resetForm();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.title.trim() ||
      !form.nmls.trim() ||
      !form.appointmentUrl.trim() ||
      !form.profileUrl.trim()
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (isEditing) {
      setOfficers((prev) =>
        prev.map((item) => (item.id === form.id ? { ...form } : item))
      );
    } else {
      setOfficers((prev) => [
        ...prev,
        {
          ...form,
          id: Date.now(),
        },
      ]);
    }

    resetForm();
  };

  const generatedHtml = useMemo(() => {
    const items = officers
      .map(
        (officer) => `
  <li>
    <strong>${escapeHtml(officer.name)}</strong><br>
    ${escapeHtml(officer.title)}, NMLS ${escapeHtml(officer.nmls)}<br>
    <a href="${escapeHtml(officer.appointmentUrl)}" target="_blank">Make Your Appointment</a><br>
    <a href="${escapeHtml(officer.profileUrl)}" target="_blank">Know More</a>
  </li>`
      )
      .join("\n");

    return `<p><strong>Sure!</strong> Please select one of our loan officers to schedule your appointment:</p>
<ul>
${items}
</ul>`;
  }, [officers]);

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      alert("Unable to copy HTML.");
    }
  };

  return (
    <div className="loan-officer-page">
      <div className="loan-officer-header">
        <h2>Loan Officer Record Manager</h2>
        <p>Update appointment links and profile records from the frontend.</p>
      </div>

      <div className="loan-officer-grid">
        <div className="loan-officer-card">
          <h3>{isEditing ? "Edit Loan Officer" : "Add Loan Officer"}</h3>

          <form onSubmit={handleSubmit} className="loan-officer-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
              />
            </div>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter designation"
              />
            </div>

            <div className="form-group">
              <label>NMLS</label>
              <input
                type="text"
                name="nmls"
                value={form.nmls}
                onChange={handleChange}
                placeholder="Enter NMLS number"
              />
            </div>

            <div className="form-group">
              <label>Appointment URL</label>
              <input
                type="url"
                name="appointmentUrl"
                value={form.appointmentUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label>Profile URL</label>
              <input
                type="url"
                name="profileUrl"
                value={form.profileUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {isEditing ? "Update Record" : "Add Record"}
              </button>

              <button type="button" className="secondary-btn" onClick={resetForm}>
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="loan-officer-card">
          <div className="card-head">
            <h3>Current Records</h3>
            <span>{officers.length} total</span>
          </div>

          <div className="officer-list">
            {officers.map((officer) => (
              <div key={officer.id} className="officer-item">
                <div className="officer-info">
                  <h4>{officer.name}</h4>
                  <p>
                    {officer.title}, NMLS {officer.nmls}
                  </p>
                  <a
                    href={officer.appointmentUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Appointment Link
                  </a>
                  <a href={officer.profileUrl} target="_blank" rel="noreferrer">
                    Profile Link
                  </a>
                </div>

                <div className="officer-actions">
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => handleEdit(officer)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => handleDelete(officer.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="loan-officer-card preview-card">
        <div className="card-head">
          <h3>Live Preview</h3>
          <button type="button" className="primary-btn small-btn" onClick={handleCopyHtml}>
            {copied ? "Copied" : "Copy HTML"}
          </button>
        </div>

        <div
          className="preview-box"
          dangerouslySetInnerHTML={{ __html: generatedHtml }}
        />
      </div>

      <div className="loan-officer-card">
        <h3>Generated HTML</h3>
        <textarea
          className="html-output"
          value={generatedHtml}
          readOnly
        />
      </div>
    </div>
  );
}