<?php include('includes/header.php'); ?>

<main>
    <h2>رفع المحاضرات</h2>

    <!-- نموذج اختيار المجلد ورفع الملف -->
    <form action="upload.php" method="POST" enctype="multipart/form-data">
        <label for="folder">اختر المجلد:</label>
        <select name="folder" id="folder">
            <?php
            $dir = 'محاضرات';
            $folders = scandir($dir);
            foreach ($folders as $folder) {
                if ($folder !== '.' && $folder !== '..') {
                    echo "<option value='$folder'>$folder</option>";
                }
            }
            ?>
        </select><br><br>

        <label for="file">اختر الملف لرفعه:</label>
        <input type="file" name="file" id="file" required><br><br>

        <input type="submit" name="submit" value="رفع الملف">
    </form>

    <!-- نموذج لإنشاء مجلد جديد -->
    <h3>إنشاء مجلد جديد</h3>
    <form action="create_folder.php" method="POST">
        <label for="new_folder">اسم المجلد الجديد:</label>
        <input type="text" name="new_folder" id="new_folder" required><br><br>
        <input type="submit" name="create" value="إنشاء المجلد">
    </form>
</main>

<?php include('includes/footer.php'); ?>
