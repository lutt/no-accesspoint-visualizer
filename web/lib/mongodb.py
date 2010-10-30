from pymongo import *

def connect():
	conn = connection.Connection("localhost", 27017)
	db = database.Database(conn, "aplist")
	return db
