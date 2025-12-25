const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'salon.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'employee', 'customer')),
            schedule TEXT
        )`);

        // Services Table
        db.run(`CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            duration INTEGER NOT NULL,
            price REAL NOT NULL
        )`);

        // Bookings Table
        db.run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            employee_id INTEGER NOT NULL,
            service_id INTEGER,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'completed', 'cancelled')),
            FOREIGN KEY (customer_id) REFERENCES users(id),
            FOREIGN KEY (employee_id) REFERENCES users(id),
            FOREIGN KEY (service_id) REFERENCES services(id)
        )`);

        // Availability Exceptions Table
        db.run(`CREATE TABLE IF NOT EXISTS availability_exceptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('day_off', 'short_day')),
            start_time TEXT, -- Null if day_off
            end_time TEXT, -- Null if day_off
            FOREIGN KEY (employee_id) REFERENCES users(id)
        )`);

        // Seed Data
        seedData();
    });
}

function seedData() {
    db.get("SELECT count(*) as count FROM users", (err, row) => {
        if (err) return console.error(err.message);
        if (row.count === 0) {
            console.log("Seeding Database...");

            // --- Users ---
            // Admin
            db.run(`INSERT INTO users (name, username, password, role) VALUES ('علي', 'admin', 'admin123', 'admin')`);

            // Employees
            db.run(`INSERT INTO users (name, username, password, role, schedule) VALUES ('سارة (تصفيف شعر)', 'sarah', 'emp123', 'employee', '["09:00","10:00","11:00","13:00","14:00","15:00"]')`);
            db.run(`INSERT INTO users (name, username, password, role, schedule) VALUES ('منى (مكياج)', 'mona', 'emp123', 'employee', '["10:00","11:00","12:00","14:00","15:00","16:00"]')`);
            db.run(`INSERT INTO users (name, username, password, role, schedule) VALUES ('نور (أظافر)', 'noor', 'emp123', 'employee', '["09:00","10:00","11:00","12:00","13:00"]')`);
            db.run(`INSERT INTO users (name, username, password, role, schedule) VALUES ('ليلى (عناية بالبشرة)', 'layla', 'emp123', 'employee', '["14:00","15:00","16:00","17:00","18:00"]')`);

            // Customers
            db.run(`INSERT INTO users (name, username, password, role) VALUES ('أمل محمد', 'amal', 'client123', 'customer')`);
            db.run(`INSERT INTO users (name, username, password, role) VALUES ('مها عبدالله', 'maha', 'client123', 'customer')`);
            db.run(`INSERT INTO users (name, username, password, role) VALUES ('هدى صالح', 'huda', 'client123', 'customer')`);

            // --- Services (Arabic) ---
            db.run(`INSERT INTO services (name, duration, price) VALUES ('قص شعر', 60, 150)`);
            db.run(`INSERT INTO services (name, duration, price) VALUES ('مكياج سهرة', 90, 300)`);
            db.run(`INSERT INTO services (name, duration, price) VALUES ('مانيكير وباديكير', 60, 180)`);
            db.run(`INSERT INTO services (name, duration, price) VALUES ('صبغة شعر', 120, 500)`);
            db.run(`INSERT INTO services (name, duration, price) VALUES ('تنظيف بشرة', 60, 250)`);
            db.run(`INSERT INTO services (name, duration, price) VALUES ('تسريحة شعر', 45, 200)`);

            // --- Bookings (Seed Data) ---
            // Need IDs, assuming standard auto-increment starting at 1
            // Users: 1(Admin), 2(Sarah), 3(Mona), 4(Noor), 5(Layla), 6(Amal), 7(Maha), 8(Huda)
            // Services: 1(Cut), 2(Makeup), 3(ManiPedi), 4(Dye), 5(Facial), 6(Style)

            const today = new Date().toISOString().split('T')[0];

            // Amal bookings
            db.run(`INSERT INTO bookings (customer_id, employee_id, service_id, date, time, status) VALUES (6, 2, 1, '${today}', '10:00', 'confirmed')`);
            db.run(`INSERT INTO bookings (customer_id, employee_id, service_id, date, time, status) VALUES (6, 3, 2, '${today}', '14:00', 'pending')`);

            // Maha bookings
            db.run(`INSERT INTO bookings (customer_id, employee_id, service_id, date, time, status) VALUES (7, 4, 3, '${today}', '11:00', 'completed')`);

            // Huda booking
            db.run(`INSERT INTO bookings (customer_id, employee_id, service_id, date, time, status) VALUES (8, 5, 5, '${today}', '16:00', 'pending')`);
        }
    });
}

module.exports = db;
