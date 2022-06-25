from hashlib import sha256
import psycopg2 

print(str(sha256("password".encode('utf-8')).hexdigest()))

conn = psycopg2.connect(host="45.77.234.200", database="comp3900db", user="comp3900_user", password="yckAPfc9MX42N4")

cursor = conn.cursor()
# cursor.execute("INSERT INTO users(id, username, pass_hash, email) VALUES (%s, %s, %s, %s);", (1, "Sample", str(sha256("password".encode('utf-8')).hexdigest()), "sample@sample.com"))
conn.commit()
# cursor.execute("SELECT * FROM users;")
cursor.execute("SELECT email FROM users WHERE email=%s AND pass_hash=%s;", ("sample@sample.com", "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"))
print(cursor.fetchone()[0])
