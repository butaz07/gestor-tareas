const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use(session({
  secret: 'gestor-tareas-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hora
}));

// ---------- Middleware de autenticación ----------
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.redirect('/login');
}

// ---------- LOGIN ----------
app.get('/login', (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/tasks');
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.get('users').find({ username }).value();

  if (!user) {
    return res.status(401).render('login', { error: 'Usuario o contraseña incorrectos' });
  }

  const passwordMatches = bcrypt.compareSync(password || '', user.password);
  if (!passwordMatches) {
    return res.status(401).render('login', { error: 'Usuario o contraseña incorrectos' });
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  res.redirect('/tasks');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// ---------- CRUD DE TAREAS ----------
const taskValidations = [
  body('title')
    .trim()
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ max: 50 }).withMessage('El título no puede superar los 50 caracteres'),
  body('dueDate')
    .notEmpty().withMessage('La fecha límite es obligatoria')
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(value);
      if (due < today) {
        throw new Error('La fecha límite no puede ser anterior a hoy');
      }
      return true;
    })
];

// LEER (listar)
app.get('/tasks', requireAuth, (req, res) => {
  const tasks = db.get('tasks').filter({ userId: req.session.userId }).value();
  res.render('tasks', { tasks, errors: [], oldInput: {}, username: req.session.username });
});

// CREAR
app.post('/tasks', requireAuth, taskValidations, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const tasks = db.get('tasks').filter({ userId: req.session.userId }).value();
    return res.status(400).render('tasks', {
      tasks,
      errors: errors.array(),
      oldInput: req.body,
      username: req.session.username
    });
  }

  const { title, description, dueDate } = req.body;
  const newId = Date.now();
  db.get('tasks')
    .push({
      id: newId,
      userId: req.session.userId,
      title: title.trim(),
      description: (description || '').trim(),
      dueDate,
      done: false
    })
    .write();

  res.redirect('/tasks');
});

// EDITAR - mostrar formulario
app.get('/tasks/:id/edit', requireAuth, (req, res) => {
  const task = db.get('tasks').find({ id: Number(req.params.id), userId: req.session.userId }).value();
  if (!task) return res.redirect('/tasks');
  res.render('edit-task', { task, errors: [], username: req.session.username });
});

// ACTUALIZAR
app.post('/tasks/:id', requireAuth, taskValidations, (req, res) => {
  const task = db.get('tasks').find({ id: Number(req.params.id), userId: req.session.userId }).value();
  if (!task) return res.redirect('/tasks');

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('edit-task', {
      task: { ...task, ...req.body },
      errors: errors.array(),
      username: req.session.username
    });
  }

  const { title, description, dueDate } = req.body;
  db.get('tasks')
    .find({ id: Number(req.params.id) })
    .assign({ title: title.trim(), description: (description || '').trim(), dueDate })
    .write();

  res.redirect('/tasks');
});

// ELIMINAR
app.post('/tasks/:id/delete', requireAuth, (req, res) => {
  db.get('tasks').remove({ id: Number(req.params.id), userId: req.session.userId }).write();
  res.redirect('/tasks');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
