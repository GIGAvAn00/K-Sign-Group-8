<?php
header("Content-Type: application/json; charset=UTF-8");
require_once "db.php";

try {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    if (!$data) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid request data."
        ]);
        exit;
    }

    $userId = trim($data["user_id"] ?? "");
    $eventId = trim($data["event_id"] ?? "");
    $eventTitle = trim($data["event_title"] ?? "");
    $fullName = trim($data["full_name"] ?? "");
    $email = trim($data["email"] ?? "");
    $ticketType = trim($data["ticket_type"] ?? "");
    $attendeesCount = (int)($data["attendees_count"] ?? 1);
    $fanMessage = trim($data["fan_message"] ?? "");

    if (!$userId || !$fullName || !$email || !$ticketType || !$attendeesCount) {
        echo json_encode([
            "success" => false,
            "message" => "All required registration fields must be filled."
        ]);
        exit;
    }

    $event = false;

    if ($eventId !== "") {
        $stmt = $pdo->prepare("
            SELECT 
                e.event_id,
                e.title,
                e.capacity,
                COALESCE(SUM(r.attendees_count), 0) AS participants
            FROM events e
            LEFT JOIN registrations r ON e.event_id = r.event_id
            WHERE e.event_id = ?
            GROUP BY e.id
        ");
        $stmt->execute([$eventId]);
        $event = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    if (!$event && $eventTitle !== "") {
        $stmt = $pdo->prepare("
            SELECT 
                e.event_id,
                e.title,
                e.capacity,
                COALESCE(SUM(r.attendees_count), 0) AS participants
            FROM events e
            LEFT JOIN registrations r ON e.event_id = r.event_id
            WHERE e.title = ?
            GROUP BY e.id
        ");
        $stmt->execute([$eventTitle]);
        $event = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    if (!$event) {
        echo json_encode([
            "success" => false,
            "message" => "Event not found."
        ]);
        exit;
    }

    $realEventId = $event["event_id"];
    $remaining = (int)$event["capacity"] - (int)$event["participants"];

    if ($attendeesCount > $remaining) {
        echo json_encode([
            "success" => false,
            "message" => "Not enough remaining slots."
        ]);
        exit;
    }

    $check = $pdo->prepare("SELECT id FROM registrations WHERE user_id = ? AND event_id = ?");
    $check->execute([$userId, $realEventId]);

    if ($check->fetch()) {
        echo json_encode([
            "success" => false,
            "message" => "You are already registered for this event."
        ]);
        exit;
    }

    $registrationId = "REG-" . time();

    $insert = $pdo->prepare("
        INSERT INTO registrations
        (registration_id, user_id, event_id, full_name, email, ticket_type, attendees_count, fan_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $insert->execute([
        $registrationId,
        $userId,
        $realEventId,
        $fullName,
        $email,
        $ticketType,
        $attendeesCount,
        $fanMessage
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Registration submitted successfully."
    ]);
} catch (Throwable $e) {
    echo json_encode([
        "success" => false,
        "message" => "Server error during registration.",
        "error" => $e->getMessage()
    ]);
}
?>