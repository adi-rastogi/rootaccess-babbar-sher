-- POLLUTIONMITRA — PostgreSQL + PostGIS Relational Schema
-- 20 Target Core Entities with Spatial Indexing

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users & Roles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'citizen',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Neighborhoods
CREATE TABLE IF NOT EXISTS neighborhoods (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) DEFAULT 'Delhi',
    boundary GEOMETRY(Polygon, 4326),
    risk_level VARCHAR(20) DEFAULT 'moderate'
);

-- 3. Sensors
CREATE TABLE IF NOT EXISTS sensors (
    id VARCHAR(50) PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    neighborhood_id VARCHAR(50) REFERENCES neighborhoods(id),
    location GEOMETRY(Point, 4326) NOT NULL,
    status VARCHAR(30) DEFAULT 'online', -- online, offline, malfunction, calibration
    battery_level INT,
    last_calibrated DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sensors_location ON sensors USING GIST(location);

-- 4. Sensor Readings (Time-series / TimescaleDB ready)
CREATE TABLE IF NOT EXISTS sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    sensor_id VARCHAR(50) REFERENCES sensors(id),
    pm25 NUMERIC(6, 2) NOT NULL,
    pm10 NUMERIC(6, 2) NOT NULL,
    aqi INT NOT NULL,
    temperature NUMERIC(4, 2),
    humidity NUMERIC(4, 2),
    quality_label VARCHAR(30) DEFAULT 'MEASURED', -- MEASURED, ESTIMATED, PREDICTED, SIMULATED, DEMO
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sensor_readings_time ON sensor_readings(sensor_id, recorded_at DESC);

-- 5. Weather Readings
CREATE TABLE IF NOT EXISTS weather_readings (
    id BIGSERIAL PRIMARY KEY,
    neighborhood_id VARCHAR(50) REFERENCES neighborhoods(id),
    wind_speed NUMERIC(5, 2),
    wind_direction_deg INT,
    temperature NUMERIC(4, 2),
    humidity NUMERIC(4, 2),
    rainfall NUMERIC(5, 2) DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Pollution Alerts
CREATE TABLE IF NOT EXISTS pollution_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id VARCHAR(50) REFERENCES sensors(id),
    neighborhood_id VARCHAR(50) REFERENCES neighborhoods(id),
    severity VARCHAR(20) NOT NULL, -- critical, high, medium, low
    pollutant VARCHAR(20) NOT NULL,
    measured_value NUMERIC(6, 2),
    threshold_value NUMERIC(6, 2),
    rationale TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Community Reports
CREATE TABLE IF NOT EXISTS community_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    category VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    neighborhood_id VARCHAR(50) REFERENCES neighborhoods(id),
    location GEOMETRY(Point, 4326),
    status VARCHAR(30) DEFAULT 'submitted', -- submitted, under_review, verified, rejected, resolved
    xp_awarded INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Reward Transactions
CREATE TABLE IF NOT EXISTS reward_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    report_id UUID REFERENCES community_reports(id),
    xp_amount INT NOT NULL,
    reason VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Eco-Route Requests & Exposure Estimates
CREATE TABLE IF NOT EXISTS route_exposure_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_point GEOMETRY(Point, 4326),
    end_point GEOMETRY(Point, 4326),
    route_geometry GEOMETRY(LineString, 4326),
    exposure_category VARCHAR(30), -- lower, moderate, higher
    est_pm25_avg NUMERIC(6, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

