<?php
if (isset($_POST['submit'])) {
    // المجلد الذي سيتم رفع الملف فيه
    $folder = $_POST['folder'];
    $uploadDir = "محاضرات/$folder/";
    
    // تحقق من وجود المجلد وإذا لم يكن موجودًا، قم بإنشائه
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // إعداد الملف المراد رفعه
    $fileName = $_FILES['file']['name'];
    $fileTmpName = $_FILES['file']['tmp_name'];
    $fileSize = $_FILES['file']['size'];
    $fileError = $_FILES['file']['error'];
    $fileType = $_FILES['file']['type'];

    // تحديد امتداد الملف
    $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    // تنسيقات الملفات المقبولة
    $allowedExts = array('pdf');

    // التحقق من نوع الملف
    if (in_array($fileExt, $allowedExts)) {
        // التحقق من وجود خطأ في رفع الملف
        if ($fileError === 0) {
            // تحديد المسار النهائي للملف
            $fileDestination = $uploadDir . basename($fileName);

            // التحقق من حجم الملف (يجب أن يكون أقل من 10MB)
            if ($fileSize <= 10000000) {
                // رفع الملف
                if (move_uploaded_file($fileTmpName, $fileDestination)) {
                    echo "تم رفع الملف بنجاح!";
                } else {
                    echo "حدث خطأ أثناء رفع الملف.";
                }
            } else {
                echo "حجم الملف أكبر من الحد المسموح.";
            }
        } else {
            echo "حدث خطأ أثناء رفع الملف.";
        }
    } else {
        echo "الملف يجب أن يكون بتنسيق PDF فقط.";
    }
}
?>
