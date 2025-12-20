"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const AdminPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Forma za kreiranje novog korisnika
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  // Edit modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("user");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/get-users");
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Učitavanje...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-600">
          Morate biti prijavljeni da biste pristupili ovoj stranici
        </p>
      </div>
    );
  }

  if (session.user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-600">
          Samo admin može pristupiti ovoj stranici
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Greška pri kreiranju korisnika");
      }

      setMessage("Korisnik uspešno kreiran!");
      setName("");
      setPassword("");
      setRole("user");
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Da li ste sigurni da želite obrisati korisnika "${userName}"?`)) {
      return;
    }

    try {
      const response = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Greška pri brisanju korisnika");
      }

      setMessage("Korisnik uspešno obrisan!");
      setError("");
      fetchUsers();
    } catch (err) {
      setError(err.message);
      setMessage("");
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditPassword(""); // Ne prikazujemo staru lozinku
    setEditRole(user.role);
    setError("");
    setMessage("");
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditName("");
    setEditPassword("");
    setEditRole("user");
    setError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/edit-user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: editingUser._id,
          name: editName,
          password: editPassword,
          role: editRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Greška pri ažuriranju korisnika");
      }

      setMessage("Korisnik uspešno ažuriran!");
      closeEditModal();
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-6 mt-16">
      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Edituj Korisnika
            </h2>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Korisničko ime
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nova lozinka (ostavi prazno da ne menjаš)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Minimum 6 karaktera"
                  minLength={editPassword ? 6 : 0}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Ostavi prazno ako ne želiš da promeniš lozinku
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Uloga
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value="user">Korisnik</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "Ažuriranje..." : "Sačuvaj"}
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Otkaži
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h1 className="mb-8 text-4xl font-bold text-gray-900">
        Admin Panel - Upravljanje Korisnicima
      </h1>

      <div className="mb-6 rounded-md bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          Prijavljeni ste kao: <strong>{session.user?.name}</strong> (
          {session.user?.role === "admin" ? "Administrator" : "Korisnik"})
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">{message}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Forma za dodavanje korisnika */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Dodaj Novog Korisnika
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Korisničko ime
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Unesite korisničko ime"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Lozinka
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Unesite lozinku (minimum 6 karaktera)"
                minLength={6}
              />
              <p className="mt-1 text-xs text-gray-500">
                Lozinka mora imati najmanje 6 karaktera
              </p>
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Uloga
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="user">Korisnik</option>
                <option value="admin">Administrator</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Admin može kreirati i brisati korisnike
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Kreiranje..." : "Kreiraj Korisnika"}
            </button>
          </form>
        </div>

        {/* Lista korisnika */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Lista Korisnika ({users.length})
          </h2>

          {loadingUsers ? (
            <p className="text-gray-600">Učitavanje korisnika...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-600">Nema korisnika u sistemu.</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <div className="flex gap-2 mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role === "admin" ? "Administrator" : "Korisnik"}
                      </span>
                      {user._id === session.user.id && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Vi
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Kreiran: {new Date(user.createdAt).toLocaleDateString('sr-RS')}
                    </p>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="rounded-md bg-yellow-600 px-3 py-1 text-sm font-medium text-white hover:bg-yellow-700"
                    >
                      Edituj
                    </button>
                    {user._id !== session.user.id && (
                      <button
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Obriši
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
