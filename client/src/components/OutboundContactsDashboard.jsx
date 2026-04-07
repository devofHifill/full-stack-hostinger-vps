<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { useApiClient } from "../hooks/useApiClient";
import "./styles/OutboundContactsDashboard.css";

=======
import React, { useEffect, useMemo, useState } from "react";
import "./OutboundContactsDashboard.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://76.13.242.148:4000";
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

const STATUS_OPTIONS = [
  "all",
  "new",
  "queued",
  "calling",
  "called",
  "failed",
  "do_not_call",
];

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  status: "new",
  notes: "",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

export default function OutboundContactsDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("all");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedIds, setSelectedIds] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [previewData, setPreviewData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [duplicateMode, setDuplicateMode] = useState("skip");
<<<<<<< HEAD
  const { requestJson } = useApiClient();

=======
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

  const hasSelected = selectedIds.length > 0;

  async function fetchContacts() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));

      if (search.trim()) params.set("search", search.trim());
      if (status !== "all") params.set("status", status);

<<<<<<< HEAD
      const data = await requestJson(
        `/outbound-contacts?${params.toString()}`,
        { method: "GET" }
      );
=======
      const res = await fetch(
        `${API_BASE}/api/outbound-contacts?${params.toString()}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch outbound contacts");
      }
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de

      setRows(Array.isArray(data.rows) ? data.rows : []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setSelectedIds([]);
    } catch (err) {
      setError(err.message || "Failed to load outbound contacts");
      setRows([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchContacts();
  }, [page, limit, search, status]);

  function openAddModal() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setIsEditMode(false);
    setShowModal(true);
  }

  function openEditModal(row) {
    setForm({
      firstName: row.firstName || "",
      lastName: row.lastName || "",
      email: row.email || "",
      phone: row.phone || "",
      status: row.status || "new",
      notes: row.notes || "",
    });
    setEditingId(row._id);
    setIsEditMode(true);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setIsEditMode(false);
    setForm(EMPTY_FORM);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setActionLoading(true);
      setError("");

      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        status: form.status,
        notes: form.notes,
      };

<<<<<<< HEAD

      await requestJson(
        isEditMode
          ? `/outbound-contacts/${editingId}`
          : `/outbound-contacts`,
        {
          method: isEditMode ? "PUT" : "POST",
          body: payload,
        }
      );
=======
      const url = isEditMode
        ? `${API_BASE}/api/outbound-contacts/${editingId}`
        : `${API_BASE}/api/outbound-contacts`;

      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save contact");
      }

>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      closeModal();
      fetchContacts();
    } catch (err) {
      setError(err.message || "Failed to save contact");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm("Delete this contact?");
    if (!ok) return;

    try {
      setActionLoading(true);
      setError("");

<<<<<<< HEAD
      await requestJson(`/outbound-contacts/${id}`, {
        method: "DELETE",
      });

=======
      const res = await fetch(`${API_BASE}/api/outbound-contacts/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete contact");
      }

>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      if (rows.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchContacts();
      }
    } catch (err) {
      setError(err.message || "Failed to delete contact");
    } finally {
      setActionLoading(false);
    }
  }

  function toggleSelectOne(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  const allVisibleSelected = useMemo(() => {
    if (!rows.length) return false;
    return rows.every((row) => selectedIds.includes(row._id));
  }, [rows, selectedIds]);

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rows.map((row) => row._id));
    }
  }

  async function handleBulkDelete() {
    if (!selectedIds.length) return;

    const ok = window.confirm(`Delete ${selectedIds.length} selected contact(s)?`);
    if (!ok) return;

    try {
      setActionLoading(true);
      setError("");

<<<<<<< HEAD
      await requestJson(`/outbound-contacts/bulk-delete`, {
        method: "POST",
        body: { ids: selectedIds },
      });
=======
      const res = await fetch(`${API_BASE}/api/outbound-contacts/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to bulk delete contacts");
      }

>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      fetchContacts();
    } catch (err) {
      setError(err.message || "Failed to bulk delete contacts");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBulkStatus(nextStatus) {
    if (!selectedIds.length) return;

    try {
      setActionLoading(true);
      setError("");

<<<<<<< HEAD
      await requestJson(`/outbound-contacts/bulk-status`, {
        method: "POST",
        body: {
          ids: selectedIds,
          status: nextStatus,
        },
      });
=======
      const res = await fetch(`${API_BASE}/api/outbound-contacts/bulk-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          status: nextStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      fetchContacts();
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  function handleStatusChange(e) {
    setPage(1);
    setStatus(e.target.value);
  }

  function goToPrevPage() {
    if (page > 1) setPage((prev) => prev - 1);
  }

  function goToNextPage() {
    if (page < totalPages) setPage((prev) => prev + 1);
  }

  async function handleFileUpload(e) {
<<<<<<< HEAD
    const file = e.target?.files?.[0];
=======
    const file = e.target.files?.[0];
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
    if (!file) return;

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

<<<<<<< HEAD
      const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
      const token = localStorage.getItem("token");

      const res = await fetch(`${apiBase}/outbound-contacts/upload-preview`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
=======
      const res = await fetch(
        `${API_BASE}/api/outbound-contacts/upload-preview`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to preview file");
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      }

      setPreviewData(data);
      setShowPreviewModal(true);
    } catch (err) {
<<<<<<< HEAD
      console.error("Upload preview error:", err);
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      if (e.target) {
        e.target.value = "";
      }
=======
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      e.target.value = "";
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
    }
  }

  async function handleImportPreviewRows() {
    if (!previewData?.rows?.length) return;

    try {
      setUploading(true);
      setError("");

<<<<<<< HEAD
      const data = await requestJson(`/outbound-contacts/import`, {
        method: "POST",
        body: {
          duplicateMode,
          rows: previewData.rows,
        },
      });

=======
      const res = await fetch(`${API_BASE}/api/outbound-contacts/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duplicateMode,
          rows: previewData.rows,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to import rows");
      }

>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
      setShowPreviewModal(false);
      setPreviewData(null);
      setDuplicateMode("skip");
      fetchContacts();
      alert(`Import completed. Inserted: ${data.insertedCount}`);
    } catch (err) {
      setError(err.message || "Failed to import rows");
    } finally {
      setUploading(false);
    }
  }

  function closePreviewModal() {
    setShowPreviewModal(false);
    setPreviewData(null);
    setDuplicateMode("skip");
  }

  return (
    <div className="outbound-page">
      <div className="outbound-header">
        <div>
          <h1>Outbound Contacts</h1>
          <p>Manage call list records for outbound calling workflows.</p>
        </div>

        <div className="outbound-header-actions">
          <label className="upload-btn">
            {uploading ? "Processing..." : "Upload CSV/XLSX"}
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileUpload}
              hidden
            />
          </label>

          <button className="primary-btn" onClick={openAddModal}>
            + Add Contact
          </button>
        </div>
      </div>

      <div className="outbound-toolbar">
        <form className="outbound-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search by name, email, or phone"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="outbound-filters">
          <select value={status} onChange={handleStatusChange}>
            {STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All Statuses" : item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasSelected && (
        <div className="bulk-bar">
          <div className="bulk-bar-left">
            <strong>{selectedIds.length}</strong> selected
          </div>

          <div className="bulk-bar-actions">
            <button onClick={() => handleBulkStatus("new")} disabled={actionLoading}>
              Mark New
            </button>
            <button
              onClick={() => handleBulkStatus("queued")}
              disabled={actionLoading}
            >
              Mark Queued
            </button>
            <button
              onClick={() => handleBulkStatus("do_not_call")}
              disabled={actionLoading}
            >
              Mark Do Not Call
            </button>
            <button
              className="danger-btn"
              onClick={handleBulkDelete}
              disabled={actionLoading}
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <div className="outbound-stats">
        <div className="stat-card">
          <span className="stat-label">Total Contacts</span>
          <strong className="stat-value">{total}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Current Page</span>
          <strong className="stat-value">{page}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Pages</span>
          <strong className="stat-value">{totalPages}</strong>
        </div>
      </div>

      {error && <div className="outbound-error">{error}</div>}

      <div className="outbound-table-card">
        <div className="table-wrap">
          <table className="outbound-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Attempts</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="table-empty">
                    Loading contacts...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="8" className="table-empty">
                    No outbound contacts found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row._id)}
                        onChange={() => toggleSelectOne(row._id)}
                      />
                    </td>
                    <td>
                      <div className="name-cell">
                        <strong>
                          {row.fullName ||
                            `${row.firstName || ""} ${row.lastName || ""}`.trim() ||
                            "—"}
                        </strong>
                        <span>ID: {row._id}</span>
                      </div>
                    </td>
                    <td>{row.email || "—"}</td>
                    <td>{row.phone || "—"}</td>
                    <td>
                      <span className={`status-badge status-${row.status}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.callAttempts ?? 0}</td>
                    <td>{formatDate(row.createdAt)}</td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => openEditModal(row)}>Edit</button>
                        <button
                          className="danger-btn"
                          onClick={() => handleDelete(row._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </div>

          <div className="pagination-actions">
            <button onClick={goToPrevPage} disabled={page <= 1 || loading}>
              Prev
            </button>
            <button onClick={goToNextPage} disabled={page >= totalPages || loading}>
              Next
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditMode ? "Edit Contact" : "Add Contact"}</h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label>First Name</label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleFormChange}
                    placeholder="John"
                  />
                </div>

                <div className="form-field">
                  <label>Last Name</label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleFormChange}
                    placeholder="Doe"
                  />
                </div>

                <div className="form-field">
                  <label>Email</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="john@example.com"
                  />
                </div>

                <div className="form-field">
                  <label>Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="+1 555 123 4567"
                  />
                </div>

                <div className="form-field">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleFormChange}>
                    {STATUS_OPTIONS.filter((item) => item !== "all").map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field form-field-full">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    rows="4"
                    value={form.notes}
                    onChange={handleFormChange}
                    placeholder="Optional notes"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Saving..."
                    : isEditMode
<<<<<<< HEAD
                      ? "Update Contact"
                      : "Create Contact"}
=======
                    ? "Update Contact"
                    : "Create Contact"}
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPreviewModal && previewData && (
        <div className="modal-backdrop" onClick={closePreviewModal}>
          <div
            className="modal-card preview-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Import Preview</h2>
              <button className="modal-close" onClick={closePreviewModal}>
                ×
              </button>
            </div>

            <div className="preview-summary">
              <div>
                <strong>File:</strong> {previewData.fileName}
              </div>
              <div>
                <strong>Total Rows:</strong> {previewData.totalRows}
              </div>
              <div>
                <strong>Valid Rows:</strong> {previewData.validRows}
              </div>
              <div>
                <strong>Invalid Rows:</strong> {previewData.invalidRows}
              </div>
              <div>
                <strong>Duplicate In File:</strong>{" "}
                {previewData.duplicateInFileCount}
              </div>
              <div>
                <strong>Duplicate In DB:</strong>{" "}
                {previewData.duplicateInDbCount}
              </div>
            </div>

            <div className="preview-controls">
              <label>Duplicate Handling</label>
              <select
                value={duplicateMode}
                onChange={(e) => setDuplicateMode(e.target.value)}
              >
                <option value="skip">Skip duplicates</option>
                <option value="import_all">Import all</option>
              </select>
            </div>

            <div className="table-wrap preview-table-wrap">
              <table className="outbound-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>First</th>
                    <th>Last</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Valid</th>
                    <th>Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.rows.map((row, idx) => (
                    <tr key={`${row.rowNumber}-${idx}`}>
                      <td>{row.rowNumber}</td>
                      <td>{row.firstName || "—"}</td>
                      <td>{row.lastName || "—"}</td>
                      <td>{row.email || "—"}</td>
                      <td>{row.phone || "—"}</td>
                      <td>
                        <span
<<<<<<< HEAD
                          className={`status-badge ${row.isValid ? "status-new" : "status-failed"
                            }`}
=======
                          className={`status-badge ${
                            row.isValid ? "status-new" : "status-failed"
                          }`}
>>>>>>> 4d56ff2d36d452c47ffc29466fe5cb9bd26d84de
                        >
                          {row.isValid ? "valid" : "invalid"}
                        </span>
                      </td>
                      <td>{row.errors?.length ? row.errors.join(", ") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={closePreviewModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={handleImportPreviewRows}
                disabled={uploading}
              >
                {uploading ? "Importing..." : "Confirm Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}