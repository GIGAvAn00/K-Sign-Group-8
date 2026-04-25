<?php
header("Content-Type: application/json; charset=UTF-8");
require_once "db.php";

try {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid request data."
        ]);
        exit;
    }

    $firstName = trim($data["firstName"] ?? "");
    $lastName = trim($data["lastName"] ?? "");
    $email = trim($data["email"] ?? "");
    $username = trim($data["username"] ?? "");
    $password = $data["password"] ?? "";

    if ($firstName === "" || $lastName === "" || $email === "" || $username === "" || $password === "") {
        echo json_encode([
            "success" => false,
            "message" => "All fields are required."
        ]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid email address."
        ]);
        exit;
    }

    $check = $pdo->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
    $check->execute([$email, $username]);

    if ($check->fetch()) {
        echo json_encode([
            "success" => false,
            "message" => "Email or username already exists."
        ]);
        exit;
    }

    $userId = "KS-" . date("Y") . "-" . rand(1000, 9999);
    $fullName = $firstName . " " . $lastName;
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("
        INSERT INTO users 
        (user_id, first_name, last_name, full_name, username, email, password, role, profile_image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $userId,
        $firstName,
        $lastName,
        $fullName,
        $username,
        $email,
        $hashedPassword,
        'fan',
        'image/K-Sign Logo.png'
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Registration successful."
    ]);
} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "message" => "Server error during registration.",
        "error" => $e->getMessage()
    ]);
}
?>