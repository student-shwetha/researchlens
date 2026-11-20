'use client';
import { useState } from 'react';
import { api } from '@/lib/client.js';
import RoleSelect from '@/components/RoleSelect.js';

const emptyUser = { name: '', email: '', password: '', role: 'STUDENT' };

function AddUserForm() {
  const [form, setForm] = useState(emptyUser);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api('/api/admin/users', { method: 'POST', body: form });
      window.location.reload();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h3>Add account</h3>
      {error && <div className="alert error">{error}</div>}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="admin-user-name">Name</label>
          <input id="admin-user-name" value={form.name} onChange={set('name')} required minLength={2} maxLength={100} />
        </div>
        <div className="field">
          <label htmlFor="admin-user-email">Email</label>
          <input id="admin-user-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} required maxLength={150} />
        </div>
        <div className="field">
          <label htmlFor="admin-user-password">Initial password <span className="hint">(8+ characters, with a letter and a number)</span></label>
          <input id="admin-user-password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} required minLength={8} />
        </div>
        <div className="field">
          <label htmlFor="admin-user-role">Role</label>
          <select id="admin-user-role" value={form.role} onChange={set('role')}>
            <option value="STUDENT">STUDENT</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>
      <button type="submit" disabled={busy}>{busy ? 'Creating…' : 'Add account'}</button>
    </form>
  );
}

function AddTaxonomyForm({ type, title, parentOptions = [] }) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const needsParent = type !== 'domain';
  const parentLabel = type === 'subdomain' ? 'Domain' : 'Subdomain';

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api('/api/admin/taxonomy', {
        method: 'POST',
        body: { type, name, description, ...(needsParent ? { parentId } : {}) },
      });
      window.location.reload();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h3>Add {title.toLowerCase()}</h3>
      {error && <div className="alert error">{error}</div>}
      {needsParent && (
        <div className="field">
          <label htmlFor={`taxonomy-parent-${type}`}>{parentLabel}</label>
          <select
            id={`taxonomy-parent-${type}`}
            value={parentId}
            onChange={(event) => setParentId(event.target.value)}
            required
            disabled={parentOptions.length === 0}
          >
            <option value="">Select a {parentLabel.toLowerCase()}…</option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
          {parentOptions.length === 0 && <p className="hint">Add a {parentLabel.toLowerCase()} first.</p>}
        </div>
      )}
      <div className="field">
        <label htmlFor={`taxonomy-name-${type}`}>{title} name</label>
        <input
          id={`taxonomy-name-${type}`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          maxLength={type === 'domain' ? 100 : 150}
        />
      </div>
      <div className="field">
        <label htmlFor={`taxonomy-description-${type}`}>Description <span className="hint">(optional)</span></label>
        <textarea
          id={`taxonomy-description-${type}`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={2000}
          rows={2}
        />
      </div>
      <button type="submit" disabled={busy || (needsParent && parentOptions.length === 0)}>
        {busy ? 'Adding…' : `Add ${title.toLowerCase()}`}
      </button>
    </form>
  );
}

function DeleteUserButton({ user }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(`Permanently delete ${user.name} (${user.email})? Their saved papers and search history will also be deleted.`)) {
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      await api(`/api/admin/users/${user.user_id}`, { method: 'DELETE' });
      window.location.reload();
    } catch (err) {
      setMessage(err.message);
      setBusy(false);
    }
  }

  return (
    <span className="row">
      <button type="button" className="secondary" onClick={remove} disabled={busy}>
        {busy ? 'Removing…' : 'Remove'}
      </button>
      {message && <span className="small muted">{message}</span>}
    </span>
  );
}

export default function AdminManagement({ users, currentUserId, domains, subdomains }) {
  const domainOptions = domains.map((domain) => ({ id: domain.domain_id, name: domain.domain_name }));
  const subdomainOptions = subdomains.map((subdomain) => ({
    id: subdomain.subdomain_id,
    name: `${subdomain.domain_name} › ${subdomain.subdomain_name}`,
  }));

  return (
    <>
      <h2>Research domains and topics</h2>
      <p className="muted small">Add entries in order: domain, subdomain, then topic. Existing entries are kept when new ones are added.</p>
      <div className="form-grid">
        <AddTaxonomyForm type="domain" title="Domain" />
        <AddTaxonomyForm type="subdomain" title="Subdomain" parentOptions={domainOptions} />
        <AddTaxonomyForm type="topic" title="Topic" parentOptions={subdomainOptions} />
      </div>

      <h2>Users &amp; roles</h2>
      <p className="muted small">New accounts receive the role and initial password set here. Removing an account also deletes its saved papers and search history.</p>
      <AddUserForm />
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Searches</th><th>Saved</th><th>Last search</th><th>Role</th><th>Account</th></tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.total_searches}</td>
                <td>{user.saved_searches}</td>
                <td className="small muted">{user.last_search_at ?? '—'}</td>
                <td><RoleSelect userId={user.user_id} role={user.role} disabled={user.user_id === currentUserId} /></td>
                <td>
                  {user.user_id === currentUserId
                    ? <span className="small muted">Current account</span>
                    : <DeleteUserButton user={user} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
