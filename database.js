const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('chess.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to databse');
    }

    const query = 'SELECT * FROM users WHERE username=?';

    db.each(query, ['Bill'], (err, row) => {
        if (err) {
            throw err;
        } else {
            console.log(row.UserID, row.Username, row.Password);
        }
    });

    db.close();
   
});