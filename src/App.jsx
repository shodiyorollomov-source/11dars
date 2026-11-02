import { useEffect, useState } from "react";
import { Bounce, ToastContainer, toast } from "react-toastify";

const STORAGE_KEY = "todos";

function readTodos() {
  try {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    if (!savedTodos) return [];

    const parsedTodos = JSON.parse(savedTodos);
    return Array.isArray(parsedTodos)
      ? parsedTodos.filter(
          (todo) =>
            todo &&
            (typeof todo.id === "string" || typeof todo.id === "number") &&
            typeof todo.title === "string" &&
            typeof todo.isCompleted === "boolean",
        )
      : [];
  } catch (error) {
    console.error("Vazifalarni saqlangan joydan o‘qib bo‘lmadi:", error);
    return [];
  }
}

function Icon({ name }) {
  const paths = {
    plus: <path d="M12 5v14m-7-7h14" />,
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2m3 0-1 14H6L5 6" />
        <path d="M10 11v5m4-5v5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    sparkles: (
      <>
        <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" />
        <path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

function App() {
  const [todos, setTodos] = useState(readTodos);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error("Vazifalarni saqlab bo‘lmadi:", error);
    }
  }, [todos]);

  const completedCount = todos.filter((todo) => todo.isCompleted).length;
  const activeCount = todos.length - completedCount;
  const visibleTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.isCompleted;
    if (filter === "completed") return todo.isCompleted;
    return true;
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    if (editingId !== null) {
      setTodos((currentTodos) =>
        currentTodos.map((todo) =>
          todo.id === editingId ? { ...todo, title: trimmedTitle } : todo,
        ),
      );
      setEditingId(null);
      toast.success("Vazifa tahrirlandi");
    } else {
      setTodos((currentTodos) => [
        {
          id:
            globalThis.crypto?.randomUUID?.() ??
            `${Date.now()}-${Math.random()}`,
          title: trimmedTitle,
          isCompleted: false,
        },
        ...currentTodos,
      ]);
      toast.success("Vazifa qo‘shildi");
    }
    setTitle("");
  };

  const resetForm = () => {
    setTitle("");
    setEditingId(null);
  };

  const toggleComplete = (id) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo,
      ),
    );
  };

  const deleteTodo = (id) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
    if (editingId === id) resetForm();
  };

  const editTodo = (todo) => {
    setEditingId(todo.id);
    setTitle(todo.title);
    document.getElementById("todo-title")?.focus();
  };

  const clearCompleted = () => {
    if (completedCount === 0) return;

    setTodos((currentTodos) =>
      currentTodos.filter((todo) => !todo.isCompleted),
    );
    if (todos.some((todo) => todo.id === editingId && todo.isCompleted))
      resetForm();
    toast.success(`${completedCount} ta bajarilgan vazifa o‘chirildi`);
  };

  return (
    <main className="page-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />

      <section className="todo-card" aria-labelledby="page-title">
        <header className="hero">
          <div className="brand-mark">
            <Icon name="check" />
          </div>
          <p className="eyebrow">KUNINGIZNI REJALASHTIRING</p>
          <h1 id="page-title">Vazifalar</h1>
          <p className="subtitle">
            Kichik qadamlar katta natijalarga olib keladi.
          </p>
        </header>

        <form className="todo-form" onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor="todo-title">
            Yangi vazifa
          </label>
          <input
            autoComplete="off"
            id="todo-title"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Nima qilish kerak?"
            value={title}
          />
          <button className="add-button" disabled={!title.trim()} type="submit">
            <Icon name={editingId !== null ? "check" : "plus"} />
            <span>{editingId !== null ? "Saqlash" : "Qo‘shish"}</span>
          </button>
          {title || editingId !== null ? (
            <button className="reset-button" onClick={resetForm} type="button">
              Bekor qilish
            </button>
          ) : null}
        </form>

        <section className="summary" aria-label="Vazifalar hisoboti">
          <div className="summary-copy">
            <span className="summary-label">Bugungi reja</span>
            <strong>
              {completedCount} <span>/ {todos.length}</span>
            </strong>
          </div>
          <div
            className="progress-track"
            aria-label={`${completedCount} ta vazifa bajarildi`}
          >
            <span
              className="progress-value"
              style={{
                width: `${todos.length ? (completedCount / todos.length) * 100 : 0}%`,
              }}
            />
          </div>
          <div className="count-badges">
            <span className="count-badge active-count">
              <span className="status-dot" />
              Bajarilmagan <strong>{activeCount}</strong>
            </span>
            <span className="count-badge completed-count">
              <span className="status-dot" />
              Bajarilgan <strong>{completedCount}</strong>
            </span>
          </div>
        </section>

        <div className="list-toolbar">
          <div
            className="filter-tabs"
            role="group"
            aria-label="Vazifalarni filtrlash"
          >
            {[
              ["all", "Barchasi"],
              ["active", "Jarayonda"],
              ["completed", "Bajarilgan"],
            ].map(([filterName, label]) => (
              <button
                aria-pressed={filter === filterName}
                className={
                  filter === filterName ? "filter-tab selected" : "filter-tab"
                }
                key={filterName}
                onClick={() => setFilter(filterName)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          <button
            className="clear-button"
            disabled={completedCount === 0}
            onClick={clearCompleted}
            type="button"
          >
            <Icon name="trash" />
            <span>Bajarilganlarni o‘chirish</span>
            <span className="clear-count">{completedCount}</span>
          </button>
        </div>

        {visibleTodos.length > 0 ? (
          <ul className="todo-list">
            {visibleTodos.map((todo) => (
              <li
                className={
                  todo.isCompleted ? "todo-item is-completed" : "todo-item"
                }
                key={todo.id}
              >
                <label className="todo-check">
                  <input
                    checked={todo.isCompleted}
                    onChange={() => toggleComplete(todo.id)}
                    type="checkbox"
                  />
                  <span className="custom-checkbox">
                    {todo.isCompleted ? <Icon name="check" /> : null}
                  </span>
                  <span className="todo-title">{todo.title}</span>
                </label>
                <div className="item-actions">
                  <button
                    aria-label={`${todo.title} vazifasini tahrirlash`}
                    className="icon-button edit-action"
                    onClick={() => editTodo(todo)}
                    title="Tahrirlash"
                    type="button"
                  >
                    <Icon name="edit" />
                  </button>
                  <button
                    aria-label={`${todo.title} vazifasini o‘chirish`}
                    className="icon-button delete-action"
                    onClick={() => deleteTodo(todo.id)}
                    title="O‘chirish"
                    type="button"
                  >
                    <Icon name="trash" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name={todos.length ? "check" : "sparkles"} />
            </div>
            <h2>
              {todos.length
                ? filter === "active"
                  ? "Barcha vazifalar bajarildi!"
                  : "Hozircha bajarilgan vazifa yo‘q"
                : "Rejangizni boshlang"}
            </h2>
            <p>
              {todos.length
                ? "Boshqa bo‘limdagi vazifalarni ham ko‘rib chiqing."
                : "Birinchi vazifangizni yozing va kuningizni tartibga soling."}
            </p>
          </div>
        )}

        <footer className="card-footer">
          <span>
            {todos.length === 0
              ? "Har bir katta ish birinchi qadamdan boshlanadi."
              : `${activeCount} ta vazifa sizni kutmoqda`}
          </span>
          <span className="footer-sparkle">
            <Icon name="sparkles" />
          </span>
        </footer>
      </section>
      <p className="page-note">Tartibli kun — xotirjam fikr ✦</p>
    </main>
  );
}

export default App;
