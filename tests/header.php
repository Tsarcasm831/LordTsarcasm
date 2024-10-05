<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php bloginfo('name'); ?> - <?php is_front_page() ? bloginfo('description') : wp_title(''); ?></title>
    <link rel="stylesheet" href="<?php echo get_template_directory_uri(); ?>/style.css" type="text/css" media="all" />
    <?php wp_head(); ?>
</head>
<body>
    <nav>
        <a href="coming-soon.html">R.O.D.</a>
        <a href="about.html">ABOUT</a>
        <a href="music.html">MUSIC</a>
        <a href="coming-soon.html">FAQ</a>
        <a href="ai_art.html">AI ART/PROJECTS</a>
    </nav>
