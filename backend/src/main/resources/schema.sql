CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(10) NOT NULL,
    password VARCHAR(255) NOT NULL,
    pension_point_id BIGINT DEFAULT NULL,
    failed_attempts INT DEFAULT 0,
    lock_time TIMESTAMP NULL DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    otp_hash VARCHAR(255) NULL,
    otp_expiry TIMESTAMP NULL,
    otp_attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP dEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

INSERT IGNORE INTO roles (name) VALUES
('ADMIN'),
('PENSION_POINT_OFFICER'),
('HO_OFFICER'),
('HO_ACCOUNTANT');

CREATE TABLE IF NOT EXISTS category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category_id BIGINT NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    warranty_expiry DATE,
    item_condition VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    location VARCHAR(150),
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id)
    REFERENCES category(id)
);

CREATE TABLE IF NOT EXISTS item_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    requested_by BIGINT NOT NULL,
    pension_point_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    reason VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by BIGINT DEFAULT NULL,
    approved_at TIMESTAMP NULL,
    rejection_reason VARCHAR(255),

    FOREIGN KEY (item_id)
    REFERENCES items(id),

    FOREIGN KEY (requested_by)
    REFERENCES users(id),

    FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS item_assignments (
   id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    pension_point_id BIGINT NOT NULL,
    assigned_to BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    returned_at TIMESTAMP NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ASSIGNED',
    remarks VARCHAR(255),

    FOREIGN KEY (item_id)
    REFERENCES items(id),

    FOREIGN KEY (assigned_to)
    REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS item_maintenance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL,
    problem_description VARCHAR(500) NOT NULL,
    action_taken VARCHAR(500),
    service_provider VARCHAR(150),
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP NULL,
    cost DECIMAL(12,2) DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (item_id)
    REFERENCES items(id)
);

CREATE TABLE IF NOT EXISTS pension_points (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255),
    telephone VARCHAR(20),
    email VARCHAR(100),
    pension_files INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);