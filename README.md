# jpg241
Author &amp; serve single progressive JPEG image which can be served as two different qualities "Two for One" :)


Transforms item thumbnail to 'steep progressive' JPEG.
Makes it so the first ~6700 bytes (on average) have a 'displayed at 180px wide' _reasonable_
looking image for most cases.  Total filesize expected to be ~72kb file on average.

File will rely _primarily_ on the first and last of 6 scans for the main imagery data.

If we are sending the full file, but cutoff at the start of the 3rd scan (keeping first two),
that's averaging about 6700 bytes (of ~72kb full file) in testing a few hundred random items.
We keep one more scan than we think we might need because:
 - scans [2..5] are small (deliberately)
 - /details/morebooks was missing last few pixel rows w/ _just_ the 1st scan.

Clients / browsers / OS can handle the truncated image and will simply 'paint what it can'.

Progressive JPEG - https://cloudinary.com/blog/progressive_jpegs_and_green_martians
