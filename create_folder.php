<?php
if (isset($_POST['create'])) {
    // اسم المجلد الجديد
    $newFolder = $_POST['new_folder'];

    // تحقق من أن الاسم غير فارغ وأن المجلد لا يحتوي على محارف غير صالحة
    if (!empty($newFolder) && preg_match("/^[a-zA-Z0-9_]+$/", $newFolder)) {
        $dirPath = 'محاضرات/' . $newFolder;
        
        // تحقق من وجود المجلد، إذا لم يكن موجودًا قم بإنشائه
        if (!is_dir($dirPath)) {
            mkdir($dirPath, 0777, true);
            echo "تم إنشاء المجلد الجديد بنجاح!";
        } else {
            echo "المجلد موجود بالفعل.";
        }
    } else {
        echo "اسم المجلد غير صالح.";
    }
}
?>
