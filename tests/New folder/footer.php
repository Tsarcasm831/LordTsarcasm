	<footer class="footer">
			<p>&copy; 2023 Lord Tsarcasm. All rights reserved.</p>

			<div class="container top-picks">
				<h2>Artist's Top Picks</h2>
				<div class="album-grid">
					<div class="album-card" onclick="openModal('success-modal')">
						<img src="images/Success the Obsession.png" alt="Success the Obsession" class="album-cover">
						<div class="album-info">
							<div class="album-title">Success the Obsession</div>
							<div class="album-details">Single - 2024</div>
						</div>
					</div>
					<div class="album-card" onclick="openModal('svt-modal')">
						<img src="images/svt.png" alt="SVT" class="album-cover">
						<div class="album-info">
							<div class="album-title">SVT</div>
							<div class="album-details">Single - 2024</div>
						</div>
					</div>
					<div class="album-card" onclick="openModal('hellstrom-modal')">
						<img src="images/hellstrom.png" alt="Hellstrom" class="album-cover">
						<div class="album-info">
							<div class="album-title">Hellstrom</div>
							<div class="album-details">Album - 2024</div>
						</div>
					</div>
				</div>
			</div>

			<div class="container current-obsession">
				<h2>Artist's Current Obsession</h2>
				<div class="spotify-links">
					<iframe src="https://open.spotify.com/embed/album/1YVl9rMklSiPCQZtuGx8Tx" width="300" height="80"></iframe>
					<iframe src="https://open.spotify.com/embed/album/0oHclsVKO0voqIP0u2cifF" width="300" height="80"></iframe>
					<iframe src="https://open.spotify.com/embed/album/3QOZgz6X3t3Asp84W9jjUx" width="300" height="80"></iframe>
					<iframe src="https://open.spotify.com/embed/album/4gSvPV6y5DvASEpwhtA8RI" width="300" height="80"></iframe>
					<iframe src="https://open.spotify.com/embed/album/22sxk4nS5F7RylIfSQ7PGi" width="300" height="80"></iframe>
				</div>
			</div>
			<?php wp_footer(); ?>
		</footer>
	</body>
</html>
