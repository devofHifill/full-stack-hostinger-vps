import { useEffect, useMemo, useState } from "react";
import { useApiClient } from "../hooks/useApiClient";
import "./styles/LoanOfficersDashboard.css";


const emptyForm = {
  _id: null,
  name: "",
  title: "",
  nmls: "",
  appointmentUrl: "",
  profileUrl: "",
  sortOrder: 0,
  isActive: true,
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
  const [officers, setOfficers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { requestJson } = useApiClient();

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await requestJson("/loan-officers", {
        method: "GET",
      });

      setOfficers(data.rows || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setError("");
  };

  const handleEdit = (officer) => {
    setForm({
      _id: officer._id,
      name: officer.name || "",
      title: officer.title || "",
      nmls: officer.nmls || "",
      appointmentUrl: officer.appointmentUrl || "",
      profileUrl: officer.profileUrl || "",
      sortOrder: officer.sortOrder || 0,
      isActive: officer.isActive ?? true,
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this loan officer?");
    if (!ok) return;

    try {
      await requestJson(`/loan-officers/${id}`, {
        method: "DELETE",
      });

      if (form._id === id) {
        resetForm();
      }

      fetchOfficers();
    } catch (err) {
      console.error(err);
      alert(err.message || "Delete failed");
    }
  };

  const validateForm = () => {
    if (
      !form.name.trim() ||
      !form.title.trim() ||
      !form.nmls.trim() ||
      !form.appointmentUrl.trim() ||
      !form.profileUrl.trim()
    ) {
      return "Please fill all fields.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        title: form.title.trim(),
        nmls: form.nmls.trim(),
        appointmentUrl: form.appointmentUrl.trim(),
        profileUrl: form.profileUrl.trim(),
        sortOrder: Number(form.sortOrder || 0),
        isActive: Boolean(form.isActive),
      };

      const url = isEditing
        ? `${API_BASE}/loan-officers/${form._id}`
        : `${API_BASE}/loan-officers`;

      const method = isEditing ? "PUT" : "POST";

      await requestJson(
        isEditing
          ? `/loan-officers/${form._id}`
          : `/loan-officers`,
        {
          method: isEditing ? "PUT" : "POST",
          body: payload,
        }
      );

      resetForm();
      fetchOfficers();
    } catch (err) {
      console.error(err);
      alert(err.message || "Unable to save record");
    } finally {
      setSaving(false);
    }
  };

  const generatedHtml = useMemo(() => {
    const items = officers
      .map(
        (officer) => `
  <li>
    <strong>${escapeHtml(officer.name)}</strong><br>
    ${escapeHtml(officer.title)}, NMLS ${escapeHtml(officer.nmls)}<br>
    <a href="${escapeHtml(officer.appointmentUrl)}" target="_blank" rel="noopener noreferrer">Make Your Appointment</a><br>
    <a href="${escapeHtml(officer.profileUrl)}" target="_blank" rel="noopener noreferrer">Know More</a>
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
        <p>Manage live loan officer records from database.</p>
      </div>

      {error && <div className="loan-officer-alert error">{error}</div>}

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

            <div className="form-group">
              <label>Sort Order</label>
              <input
                type="number"
                name="sortOrder"
                value={form.sortOrder}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            <div className="form-group checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />
                Active
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving
                  ? "Saving..."
                  : isEditing
                    ? "Update Record"
                    : "Add Record"}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={resetForm}
                disabled={saving}
              >
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

          {loading ? (
            <div className="loan-officer-empty">Loading records...</div>
          ) : officers.length === 0 ? (
            <div className="loan-officer-empty">No loan officers found.</div>
          ) : (
            <div className="officer-list">
              {officers.map((officer) => (
                <div key={officer._id} className="officer-item">
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
                    <a
                      href={officer.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
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
                      onClick={() => handleDelete(officer._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="loan-officer-card preview-card">
        <div className="card-head">
          <h3>Live Preview</h3>
          <button
            type="button"
            className="primary-btn small-btn"
            onClick={handleCopyHtml}
          >
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
        <textarea className="html-output" value={generatedHtml} readOnly />
      </div>
    </div>
  );
}