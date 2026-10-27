SELECT 'CREATE USER daw WITH PASSWORD ''2026'''
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'daw') \gexec

SELECT 'CREATE DATABASE clinica OWNER daw'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'clinica') \gexec
