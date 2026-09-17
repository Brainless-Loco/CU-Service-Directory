import { ServiceGroup, ServiceItem, PortalNotice, AdminUser } from '../types';

export const INITIAL_GROUPS: ServiceGroup[] = [
  {
    id: 'group-student',
    name: 'Student Services',
    description: 'Central student web portals, academic mail, identity, fees, and residential amenities.',
    order: 1,
    iconName: 'GraduationCap',
    color: 'emerald',
  },
  {
    id: 'group-faculty',
    name: 'Faculty & Staff Services',
    description: 'Portals for faculty communication, institutional resources, profile directory, and leaves.',
    order: 2,
    iconName: 'Briefcase',
    color: 'sky',
  },
  {
    id: 'group-academic',
    name: 'Academic & Examination',
    description: 'Result publication, transcript verification, degree archive, and examination protocols.',
    order: 3,
    iconName: 'Award',
    color: 'indigo',
  },
  {
    id: 'group-ict',
    name: 'ICT & Digital Infrastructure',
    description: 'Wi-Fi access, institutional networking, domain services, security, and ICT Cell helpdesk.',
    order: 4,
    iconName: 'Server',
    color: 'amber',
  },
  {
    id: 'group-library',
    name: 'Library & Research Resources',
    description: 'Central library catalog, digital repository, subscribed scientific databases, and thesis repository.',
    order: 5,
    iconName: 'BookOpen',
    color: 'teal',
  },
  {
    id: 'group-campus',
    name: 'Campus Life & Logistics',
    description: 'CU historic shuttle train tracking, campus medical dispensary, sports, and guest house bookings.',
    order: 6,
    iconName: 'Compass',
    color: 'rose',
  },
];

// High-quality SVG banners in landscape aspect ratio for default logos with robust hex background color support
export const createLandscapeLogoSvg = (title: string, subtitle: string, bgGradient: string, accentColor: string): string => {
  const parts = bgGradient.split(',');
  const color1 = parts[0]?.trim() || '#064e3b';
  // If only one color provided, calculate or use darkened version
  const color2 = parts[1]?.trim() || color1;
  const safeId = `g_${Math.abs(title.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)).toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="100%">
    <defs>
      <linearGradient id="${safeId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}" />
        <stop offset="100%" stop-color="${color2}" />
      </linearGradient>
      <pattern id="grid_${safeId}" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
      </pattern>
    </defs>
    <rect width="640" height="360" fill="url(#${safeId})" />
    <rect width="640" height="360" fill="url(#grid_${safeId})" />
    
    <!-- Top Emblem badge and institutional tag -->
    <rect x="40" y="32" width="140" height="28" rx="14" fill="rgba(255,255,255,0.14)" />
    <circle cx="54" cy="46" r="6" fill="${accentColor || '#38bdf8'}" />
    <text x="68" y="50" fill="#ffffff" font-size="12" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="600" letter-spacing="0.5">CU PORTAL</text>
    
    <!-- University Seal Silhouette Accent -->
    <g transform="translate(420, 50) scale(0.4)">
  <path fill="rgba(255,255,255,0.3)" d="
    M 263.000 30.000 C 262.720 32.232 262.280 35.739 262.000 37.971 C 261.830 40.174 261.883 44.047 261.748 46.252 C 261.616 48.410 261.234 52.177 261.000 54.327 C 260.768 56.456 260.267 60.172 260.000 62.298 C 259.733 64.423 259.290 68.146 259.000 70.269 C 258.712 72.379 258.215 76.074 257.831 78.169 C 257.453 80.233 256.519 83.791 256.144 85.856 C 255.764 87.953 255.285 91.655 255.000 93.767 C 254.713 95.890 254.406 99.635 254.000 101.738 C 253.605 103.784 252.421 107.253 252.000 109.295 C 251.570 111.379 251.216 115.098 250.812 117.188 C 250.415 119.242 249.509 122.793 249.000 124.822 C 248.493 126.844 247.533 130.364 247.000 132.379 C 246.467 134.394 245.533 137.920 245.000 139.935 C 244.467 141.950 243.636 145.507 243.000 147.492 C 242.370 149.460 240.942 152.791 240.258 154.742 C 239.573 156.697 238.567 160.185 237.865 162.135 C 237.164 164.079 235.827 167.440 235.000 169.334 C 234.172 171.229 232.595 174.490 231.663 176.337 C 230.728 178.190 229.013 181.393 228.000 183.204 C 226.982 185.024 225.170 188.195 224.048 189.952 C 222.910 191.734 220.892 194.848 219.533 196.467 C 218.095 198.180 215.316 200.959 213.604 202.396 C 211.779 203.661 208.913 205.647 207.089 206.911 C 204.983 207.496 201.674 208.415 199.569 209.000 C 197.573 209.277 194.002 209.317 192.012 209.000 C 189.965 208.674 186.472 207.536 184.615 206.615 C 182.791 205.351 179.924 203.364 178.100 202.100 C 177.232 200.112 175.868 196.987 175.000 194.999 C 175.000 192.651 175.000 188.962 175.000 186.614 C 175.131 184.476 175.602 180.748 176.000 178.643 C 176.387 176.592 177.405 173.079 177.939 171.061 C 178.472 169.048 179.359 165.511 180.000 163.530 C 180.637 161.563 182.060 158.231 182.726 156.274 C 183.394 154.309 184.431 150.827 185.000 148.831 C 185.571 146.826 186.439 143.282 187.000 141.274 C 187.559 139.273 188.587 135.785 189.200 133.800 C 189.812 131.820 190.955 128.378 191.593 126.407 C 192.232 124.435 193.401 121.001 193.987 119.013 C 194.551 116.899 195.436 113.576 196.000 111.462 C 194.943 110.276 193.282 108.412 192.226 107.226 C 190.136 106.602 186.852 105.623 184.762 105.000 C 182.794 104.363 179.397 103.105 177.438 102.438 C 175.373 101.756 172.128 100.683 170.063 100.000 C 169.388 102.058 168.327 105.291 167.651 107.349 C 166.975 109.303 165.637 112.668 165.000 114.636 C 164.359 116.614 163.469 120.146 162.864 122.136 C 162.261 124.119 161.119 127.561 160.470 129.530 C 159.822 131.496 158.638 134.921 158.000 136.891 C 157.361 138.865 156.311 142.340 155.683 144.317 C 155.055 146.292 153.914 149.734 153.290 151.710 C 152.665 153.689 151.571 157.152 151.000 159.147 C 150.427 161.151 149.533 164.689 149.000 166.704 C 148.467 168.719 147.533 172.245 147.000 174.261 C 146.467 176.276 145.533 179.802 145.000 181.817 C 144.467 183.832 143.533 187.359 143.000 189.374 C 142.467 191.389 141.533 194.915 141.000 196.931 C 140.467 198.946 139.533 202.472 139.000 204.487 C 138.467 206.502 137.397 209.997 137.000 212.044 C 136.592 214.146 136.396 217.908 135.990 220.010 C 135.594 222.057 134.447 225.535 134.000 227.571 C 133.547 229.638 133.018 233.306 132.617 235.383 C 132.218 237.447 131.353 241.027 131.000 243.099 C 130.641 245.207 130.319 248.943 129.951 251.049 C 129.589 253.116 128.655 256.674 128.264 258.736 C 127.868 260.822 127.301 264.495 127.000 266.597 C 126.697 268.718 126.222 272.437 126.000 274.568 C 125.775 276.726 125.458 280.509 125.326 282.674 C 125.192 284.872 125.179 288.730 125.000 290.924 C 124.825 293.059 124.131 296.757 124.000 298.895 C 123.864 301.127 124.000 305.044 124.000 307.280 C 124.000 309.516 124.136 313.433 124.000 315.665 C 123.869 317.803 123.131 321.498 123.000 323.636 C 122.864 325.868 123.000 329.785 123.000 332.021 C 123.000 334.257 123.000 338.170 123.000 340.406 C 123.000 342.642 123.000 346.555 123.000 348.791 C 123.000 351.027 122.864 354.945 123.000 357.176 C 123.131 359.315 123.869 363.009 124.000 365.147 C 124.136 367.379 123.864 371.300 124.000 373.532 C 124.131 375.671 124.733 379.378 125.000 381.503 C 125.267 383.629 125.733 387.349 126.000 389.474 C 126.267 391.600 126.693 395.325 127.000 397.445 C 127.304 399.544 127.892 403.211 128.294 405.294 C 128.692 407.353 129.504 410.934 130.000 412.972 C 130.493 414.998 131.467 418.514 132.000 420.529 C 132.533 422.544 133.502 426.062 134.000 428.086 C 134.501 430.121 135.211 433.721 135.747 435.747 C 136.278 437.754 137.361 441.224 138.000 443.199 C 138.637 445.168 139.868 448.575 140.534 450.534 C 141.201 452.495 142.266 455.962 143.000 457.898 C 143.732 459.830 145.119 463.174 146.029 465.029 C 146.945 466.896 148.903 469.978 149.837 471.837 C 150.764 473.683 152.048 477.077 153.000 478.911 C 153.961 480.764 155.933 483.845 157.000 485.640 C 158.067 487.434 159.841 490.632 161.000 492.368 C 162.184 494.140 164.531 497.045 165.775 498.775 C 167.009 500.491 169.006 503.611 170.290 505.290 C 171.606 507.011 174.119 509.853 175.512 511.512 C 176.905 513.171 179.269 516.138 180.734 517.734 C 182.246 519.381 185.082 522.082 186.663 523.663 C 188.244 525.244 190.945 528.080 192.592 529.592 C 194.188 531.057 197.094 533.499 198.814 534.814 C 200.494 536.098 203.592 538.125 205.329 539.329 C 207.067 540.533 210.052 542.724 211.844 543.844 C 213.608 544.946 216.837 546.637 218.652 547.652 C 220.468 548.668 223.626 550.478 225.460 551.460 C 227.287 552.438 230.500 554.126 232.379 555.000 C 234.252 555.871 237.568 557.327 239.521 558.000 C 241.490 558.678 245.083 559.384 247.055 560.055 C 249.011 560.720 252.255 562.364 254.220 563.000 C 256.210 563.644 259.789 564.446 261.842 564.842 C 263.934 565.246 267.637 565.713 269.748 566.000 C 271.870 566.288 275.593 566.733 277.719 567.000 C 279.844 567.267 283.564 567.733 285.689 568.000 C 287.815 568.267 291.522 568.869 293.660 569.000 C 295.892 569.136 299.809 569.000 302.045 569.000 C 304.281 569.000 308.199 569.136 310.431 569.000 C 312.569 568.869 316.276 568.267 318.401 568.000 C 320.527 567.733 324.268 567.399 326.372 567.000 C 328.422 566.611 331.920 565.534 333.950 565.050 C 335.991 564.564 339.609 563.908 341.636 563.364 C 343.638 562.826 347.052 561.580 349.042 561.000 C 351.043 560.416 354.625 559.671 356.599 559.000 C 358.555 558.335 361.837 556.800 363.741 556.000 C 365.646 555.200 369.022 553.895 370.884 553.000 C 372.756 552.100 375.907 550.278 377.726 549.274 C 379.547 548.269 382.766 546.563 384.533 545.467 C 386.327 544.354 389.334 542.202 391.068 541.000 C 392.808 539.794 395.886 537.727 397.563 536.437 C 399.280 535.116 402.126 532.607 403.785 531.215 C 405.445 529.822 408.411 527.457 410.007 525.993 C 411.655 524.481 414.355 521.645 415.937 520.063 C 417.518 518.482 420.354 515.782 421.866 514.134 C 423.330 512.538 425.772 509.633 427.088 507.912 C 428.372 506.233 430.399 503.135 431.603 501.397 C 432.807 499.660 434.914 496.620 436.118 494.882 C 437.322 493.145 439.513 490.160 440.633 488.367 C 441.735 486.603 443.456 483.392 444.440 481.560 C 445.421 479.733 447.078 476.505 448.000 474.649 C 448.920 472.796 450.488 469.532 451.349 467.651 C 452.209 465.772 453.623 462.444 454.450 460.550 C 455.277 458.657 456.811 455.379 457.550 453.450 C 458.292 451.516 459.362 448.050 460.000 446.079 C 460.639 444.106 461.707 440.638 462.338 438.662 C 462.968 436.688 464.110 433.246 464.731 431.269 C 465.353 429.289 466.555 425.851 467.000 423.823 C 467.457 421.738 467.699 417.991 468.104 415.896 C 468.501 413.845 469.618 410.349 470.000 408.296 C 470.392 406.190 470.670 402.442 471.000 400.325 C 471.325 398.239 472.134 394.630 472.457 392.543 C 472.784 390.425 473.232 386.698 473.436 384.564 C 473.644 382.395 473.790 378.581 474.000 376.412 C 474.207 374.280 474.733 370.567 475.000 368.441 C 475.267 366.316 475.869 362.609 476.000 360.471 C 476.136 358.239 476.000 354.322 476.000 352.086 C 476.000 349.849 476.000 345.936 476.000 343.700 C 476.000 341.464 476.000 337.551 476.000 335.315 C 476.000 333.079 476.000 329.166 476.000 326.930 C 476.000 324.694 476.136 320.777 476.000 318.545 C 475.869 316.407 475.131 312.713 475.000 310.574 C 474.864 308.342 475.115 304.422 475.000 302.189 C 474.889 300.038 474.286 296.305 474.154 294.154 C 474.019 291.939 474.157 288.047 474.000 285.833 C 473.849 283.696 473.267 279.988 473.000 277.862 C 472.733 275.737 472.267 272.017 472.000 269.892 C 471.733 267.766 471.267 264.046 471.000 261.921 C 470.733 259.795 470.269 256.075 470.000 253.950 C 469.731 251.826 469.391 248.087 468.985 245.985 C 468.590 243.938 467.393 240.470 467.000 238.422 C 466.596 236.318 466.406 232.555 466.000 230.451 C 465.605 228.405 464.533 224.910 464.000 222.895 C 463.467 220.880 462.457 217.372 462.000 215.338 C 461.537 213.278 460.972 209.622 460.553 207.553 C 460.136 205.496 459.414 201.892 458.866 199.866 C 458.325 197.866 457.014 194.473 456.472 192.472 C 455.924 190.447 455.334 186.812 454.786 184.786 C 454.245 182.785 453.030 179.364 452.392 177.392 C 451.754 175.421 450.584 171.986 450.000 169.998 C 449.412 167.998 448.545 164.454 448.000 162.441 C 447.456 160.432 446.517 156.912 445.919 154.919 C 445.323 152.934 444.181 149.491 443.525 147.525 C 442.869 145.562 441.637 142.155 441.000 140.186 C 440.361 138.211 439.406 134.703 438.738 132.738 C 438.072 130.781 436.637 127.453 436.000 125.487 C 435.359 123.505 434.621 119.922 433.950 117.950 C 433.285 115.995 431.732 112.719 431.000 110.787 C 430.288 108.735 429.168 105.509 428.456 103.456 C 426.953 102.768 424.591 101.688 423.088 101.000 C 421.088 101.840 417.946 103.160 415.946 104.000 C 414.006 104.726 410.529 105.765 408.568 106.432 C 406.518 107.151 403.297 108.281 401.247 109.000 C 401.738 111.047 402.509 114.263 403.000 116.310 C 403.592 118.292 404.947 121.655 405.613 123.613 C 406.280 125.575 407.362 129.037 408.000 131.009 C 408.638 132.980 409.733 136.438 410.400 138.400 C 411.066 140.358 412.363 143.740 413.000 145.708 C 413.640 147.685 414.518 151.220 415.187 153.187 C 415.853 155.143 417.360 158.442 418.000 160.407 C 418.646 162.389 419.514 165.937 420.000 167.964 C 420.490 170.006 421.263 173.599 421.661 175.661 C 422.063 177.741 422.826 181.380 423.000 183.491 C 423.184 185.720 423.121 189.644 423.000 191.876 C 422.750 194.121 422.358 197.648 422.108 199.892 C 420.564 201.436 418.137 203.863 416.593 205.407 C 414.605 206.275 411.481 207.639 409.492 208.508 C 407.202 208.646 403.602 208.862 401.311 209.000 C 399.133 208.589 395.711 207.944 393.534 207.534 C 391.709 206.269 388.843 204.283 387.019 203.019 C 385.306 201.581 382.588 198.749 381.089 197.089 C 379.645 195.490 377.234 192.579 376.000 190.812 C 374.804 189.102 373.036 185.897 372.000 184.084 C 370.969 182.280 369.168 179.117 368.252 177.252 C 367.340 175.397 365.978 172.045 365.151 170.151 C 364.324 168.257 362.736 164.999 362.050 163.050 C 361.359 161.086 360.641 157.496 360.000 155.514 C 359.363 153.548 357.929 150.220 357.263 148.263 C 356.595 146.298 355.542 142.819 355.000 140.815 C 354.454 138.796 353.580 135.237 353.183 133.183 C 352.779 131.093 352.430 127.373 352.000 125.288 C 351.579 123.246 350.419 119.773 350.000 117.731 C 349.572 115.645 349.235 111.922 348.830 109.830 C 348.434 107.777 347.373 104.262 347.000 102.204 C 346.618 100.096 346.267 96.358 346.000 94.233 C 345.733 92.107 345.267 88.387 345.000 86.262 C 344.733 84.136 344.267 80.417 344.000 78.291 C 343.733 76.165 343.267 72.446 343.000 70.320 C 342.733 68.195 342.267 64.475 342.000 62.349 C 341.733 60.224 341.267 56.504 341.000 54.378 C 340.733 52.253 340.267 48.533 340.000 46.408 C 339.733 44.282 339.221 40.567 339.000 38.437 C 338.812 36.167 338.517 32.599 338.329 30.329 C 336.020 30.237 332.390 30.092 330.081 30.000 C 327.845 29.956 323.932 30.000 321.696 30.000 C 319.460 30.000 315.547 30.000 313.311 30.000 C 311.074 30.000 307.161 30.000 304.925 30.000 C 302.689 30.000 298.776 30.000 296.540 30.000 C 294.304 30.000 290.391 30.000 288.155 30.000 C 285.919 30.000 282.006 30.000 279.770 30.000 C 277.534 30.000 273.621 30.000 271.385 30.000 C 269.037 30.000 265.348 30.000 263.000 30.000 Z" />
</g>
    
    <!-- Main Service Brand Title -->
    <text x="40" y="190" fill="#ffffff" font-size="30" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="700">${title}</text>
    <text x="40" y="235" fill="rgba(255,255,255,0.85)" font-size="16" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="500">${subtitle}</text>
    
    <!-- Bottom Bar -->
    <rect x="40" y="310" width="120" height="4" rx="2" fill="${accentColor || '#38bdf8'}" />
    <text x="590" y="320" fill="rgba(255,255,255,0.6)" font-size="14" font-family="monospace" text-anchor="end">services.cu.ac.bd</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-inst-email',
    title: 'Institutional Email Service',
    description: 'Official cloud-hosted Google Workspace email for all registered undergraduate and postgraduate students of University of Chittagong with lifetime academic access and drive storage.',
    groupId: 'group-student',
    portalUrl: 'https://mail.google.com/a/cu.ac.bd',
    logoUrl: createLandscapeLogoSvg('Institutional Email', 'Student @cu.ac.bd Mailbox', '#064e3b,#022c22', '#34d399'),
    logoRatio: '16:9',
    tags: ['Email', 'Google Workspace', 'Communication'],
    isFeatured: true,
    status: 'ACTIVE',
    badgeText: 'Essential',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-alias-email',
    title: 'Alias Email Service',
    description: 'Personalized forwarding email addresses and departmental aliases for club executives, research scholars, and university student leadership to safeguard personal inboxes.',
    groupId: 'group-student',
    portalUrl: 'https://alias.cu.ac.bd',
    logoUrl: createLandscapeLogoSvg('Alias Email Service', 'Forwarding & Custom Handles', '#0f172a,#1e293b', '#38bdf8'),
    logoRatio: '16:9',
    tags: ['Email', 'Alias', 'Privacy'],
    isFeatured: true,
    status: 'ACTIVE',
    badgeText: 'Popular',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-sis-portal',
    title: 'Student Information System (SIS)',
    description: 'Comprehensive academic portal for course pre-registration, semester credit tracking, admit card downloads, hall dues verification, and personal profile updates.',
    groupId: 'group-student',
    portalUrl: 'https://sis.cu.ac.bd',
    logoUrl: createLandscapeLogoSvg('Student Information (SIS)', 'Registration, Dues & Records', '#1e1b4b,#312e81', '#818cf8'),
    logoRatio: '16:9',
    tags: ['SIS', 'Enrollment', 'Admit Card'],
    isFeatured: true,
    status: 'ACTIVE',
    badgeText: 'Academic',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-smart-campus-app',
    title: 'CU Smart Campus Mobile App',
    description: 'Official unified mobile experience featuring digital student ID cards, live class schedule notifications, bus timetables, and campus map navigation.',
    groupId: 'group-student',
    // Coming Soon service with no mandatory link
    portalUrl: '',
    logoUrl: createLandscapeLogoSvg('CU Smart Campus App', 'iOS & Android Unified App', '#312e81,#4338ca', '#a78bfa'),
    logoRatio: '16:9',
    tags: ['Mobile', 'Smart Campus', 'Digital ID'],
    isFeatured: true,
    status: 'COMING_SOON',
    badgeText: 'Coming Soon',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-epayment',
    title: 'CU e-Payment Gateway',
    description: 'Secure university fee clearing gateway supporting bKash, Nagad, Rocket, cards, and Sonali Bank e-Sheba for tuition fees, hall deposits, and exam fees.',
    groupId: 'group-student',
    portalUrl: 'https://payment.cu.ac.bd',
    logoUrl: createLandscapeLogoSvg('CU e-Payment Gateway', 'Instant Tuition & Dues Clearing', '#701a75,#4a044e', '#f472b6'),
    logoRatio: '16:9',
    tags: ['Fees', 'bKash', 'Bank'],
    isFeatured: false,
    status: 'ACTIVE',
    badgeText: '24/7 Pay',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-faculty-email',
    title: 'Faculty & Officer Mail Gateway',
    description: 'High-security administrative mail portal for faculty members, provosts, departmental chairpersons, and administration officers with calendar integration and 2FA protection.',
    groupId: 'group-faculty',
    portalUrl: 'https://mail.cu.ac.bd',
    logoUrl: createLandscapeLogoSvg('Faculty Mail Gateway', 'Secure Officer Exchange', '#0c4a6e,#082f49', '#38bdf8'),
    logoRatio: '16:9',
    tags: ['Faculty', 'Mail', 'Administration'],
    isFeatured: true,
    status: 'ACTIVE',
    badgeText: 'Staff Only',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-research-profile',
    title: 'CU Faculty Research Directory',
    description: 'Central repository of faculty research publications, Scopus indexed papers, conference proceedings, PhD supervisions, and academic biography showcase.',
    groupId: 'group-faculty',
    portalUrl: 'https://research.cu.ac.bd',
    logoUrl: createLandscapeLogoSvg('Faculty Research Directory', 'Scholarly Profiles & Publications', '#14532d,#052e16', '#4ade80'),
    logoRatio: '16:9',
    tags: ['Research', 'Publications', 'Faculty'],
    isFeatured: false,
    status: 'ACTIVE',
    badgeText: 'Scholarly',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-convocation-portal',
    title: 'CU Convocation Registration',
    description: 'Online convocation registration, gown measurement submission, guest passes booking, and degree certificate collection scheduling for graduating cohorts.',
    groupId: 'group-academic',
    portalUrl: '',
    logoUrl: createLandscapeLogoSvg('CU Convocation Portal', 'Degree Conferment & Gown Booking', '#831843,#4c0519', '#fb7185'),
    logoRatio: '16:9',
    tags: ['Convocation', 'Degree', 'Graduation'],
    isFeatured: false,
    status: 'COMING_SOON',
    badgeText: 'Coming Soon',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-cert-verification',
    title: 'Central Certificate Verification',
    description: 'Online verification platform for employer agencies, foreign universities, and embassies to digitally validate provisional certificates, transcripts, and degrees issued by CU.',
    groupId: 'group-academic',
    portalUrl: 'https://verify.cu.ac.bd',
    logoUrl: createLandscapeLogoSvg('Certificate Verification', 'QR & Transcript Authentication', '#3730a3,#1e1b4b', '#a5b4fc'),
    logoRatio: '16:9',
    tags: ['Verification', 'Degree', 'Security'],
    isFeatured: true,
    status: 'ACTIVE',
    badgeText: 'Official',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-result-archive',
    title: 'Result & Exam Archives',
    description: 'Semester result publishing system, departmental grade sheets, supplementary examination routines, and official GPA tabulation sheets for all academic faculties.',
    groupId: 'group-academic',
    portalUrl: 'https://result.cu.ac.bd',
    logoUrl: createLandscapeLogoSvg('Result & Exam Archives', 'Semester GPA & Grade Reports', '#831843,#500724', '#f43f5e'),
    logoRatio: '16:9',
    tags: ['Results', 'Exams', 'Grades'],
    isFeatured: false,
    status: 'ACTIVE',
    badgeText: 'Published',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-campus-wifi',
    title: 'Campus Wi-Fi & Eduroam Access',
    description: 'Self-service MAC address registration and credentials issuance for high-speed fiber-backed wireless internet across CU academic buildings, libraries, and student dormitories.',
    groupId: 'group-ict',
    portalUrl: 'https://wifi.cu.ac.bd',
    logoUrl: createLandscapeLogoSvg('Campus Wi-Fi & Eduroam', 'High-Speed Wireless Registration', '#78350f,#451a03', '#fbbf24'),
    logoRatio: '16:9',
    tags: ['Wi-Fi', 'Eduroam', 'ICT'],
    isFeatured: true,
    status: 'ACTIVE',
    badgeText: 'Network',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-ict-helpdesk',
    title: 'ICT Cell Central Helpdesk',
    description: 'Centralized IT ticketing service for password resets, email recovery, server provisioning, network troubleshooting, and hardware support for university departments.',
    groupId: 'group-ict',
    portalUrl: 'https://helpdesk.cu.ac.bd',
    logoUrl: createLandscapeLogoSvg('ICT Cell Helpdesk', 'IT Support & Ticket Management', '#1e293b,#0f172a', '#60a5fa'),
    logoRatio: '16:9',
    tags: ['Helpdesk', 'Support', 'Troubleshoot'],
    isFeatured: false,
    status: 'ACTIVE',
    badgeText: 'Support',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-legacy-erp-archived',
    title: 'Legacy Departmental Archives',
    description: 'Historical archive of retired departmental legacy file transfer records. Archived and disabled from public view.',
    groupId: 'group-ict',
    portalUrl: 'https://archive-old.cu.ac.bd',
    logoUrl: createLandscapeLogoSvg('Legacy Departmental Archives', 'Internal Historical Repositories', '#334155,#1e293b', '#94a3b8'),
    logoRatio: '16:9',
    tags: ['Archive', 'Internal'],
    isFeatured: false,
    status: 'DISABLED', // Hidden on public portal, but visible in admin for re-enabling
    badgeText: 'Archived',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-central-library',
    title: 'CU Central Library & DSpace',
    description: 'Digital catalog offering access to open-access university theses, e-books, institutional repository, JSTOR, IEEE Xplore, and Taylor & Francis subscriptions.',
    groupId: 'group-library',
    portalUrl: 'https://library.cu.ac.bd',
    logoUrl: createLandscapeLogoSvg('Central Library DSpace', 'Digital Archives & e-Resources', '#134e4a,#042f2e', '#2dd4bf'),
    logoRatio: '16:9',
    tags: ['Library', 'Books', 'Journals'],
    isFeatured: false,
    status: 'ACTIVE',
    badgeText: 'Digital Lib',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-shuttle-tracker',
    title: 'CU Shuttle Train Tracker',
    description: 'Live GPS tracking and scheduled timetable of the iconic Chittagong University Shuttle Train running between Chattogram Railway Station (Battali) and CU Campus.',
    groupId: 'group-campus',
    portalUrl: 'https://transport.cu.ac.bd/shuttle',
    logoUrl: createLandscapeLogoSvg('Shuttle Train Tracker', 'Live GPS & Route Timetable', '#881337,#4c0519', '#fb7185'),
    logoRatio: '16:9',
    tags: ['Shuttle', 'Train', 'Transit'],
    isFeatured: true,
    status: 'ACTIVE',
    badgeText: 'Live GPS',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'srv-medical-portal',
    title: 'CU Medical Center & Telemedicine',
    description: 'Online consultation booking, medical record archives, emergency ambulance dispatch, and prescription management provided by the University Medical Center.',
    groupId: 'group-campus',
    portalUrl: 'https://medical.cu.ac.bd',
    logoUrl: createLandscapeLogoSvg('CU Medical Center', 'Health Services & Ambulance', '#1e3a8a,#172554', '#93c5fd'),
    logoRatio: '16:9',
    tags: ['Medical', 'Emergency', 'Health'],
    isFeatured: false,
    status: 'ACTIVE',
    badgeText: 'Emergency',
    updatedAt: new Date().toISOString(),
  },
];

// Initial Notices to be shown after the header when active and between startTime and endTime
const now = new Date();
const pastDate = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
const futureDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days later
const farFutureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

export const INITIAL_NOTICES: PortalNotice[] = [
  {
    id: 'notice-smart-campus-2026',
    title: 'CU Smart Campus Mobile App Launching Soon',
    message: 'The ICT Cell is preparing the unified University of Chittagong mobile app for iOS and Android. Digital student ID verification and shuttle tracking will be included.',
    type: 'coming_soon',
    badgeText: 'Coming Soon',
    linkText: 'Learn More',
    linkUrl: 'https://ict.cu.ac.bd',
    startTime: pastDate,
    endTime: futureDate,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notice-wifi-maintenance',
    title: 'Scheduled Fiber Network Maintenance on Central Server Cluster',
    message: 'Routine optical fiber backbone maintenance will occur this Friday between 02:00 AM - 05:00 AM. Access to internal SIS portals may experience brief latency.',
    type: 'maintenance',
    badgeText: 'Scheduled Maintenance',
    linkText: 'ICT Support',
    linkUrl: 'mailto:ict@cu.ac.bd',
    startTime: pastDate,
    endTime: farFutureDate,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
];

// Initial Admin & Maintenance Users database with auto-generated passwords
export const INITIAL_USERS: AdminUser[] = [
  {
    id: 'usr-tonmoy-superadmin',
    email: 'tonmoy.ict@cu.ac.bd',
    fullName: 'Tonmoy (Lead System Architect)',
    department: 'ICT Cell Administration',
    role: 'SUPER_ADMIN',
    passwordPlain: 'cu@admin2026',
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'usr-services-maintenance',
    email: 'services.maint@cu.ac.bd',
    fullName: 'Services Maintenance Admin',
    department: 'ICT Infrastructure Operations',
    role: 'MAINTENANCE_SERVICES',
    passwordPlain: 'CU#9mX4$pL2!',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-notices-officer',
    email: 'notice.officer@cu.ac.bd',
    fullName: 'Notice & Announcement Officer',
    department: 'Public Relations & Registrar',
    role: 'MAINTENANCE_NOTICES',
    passwordPlain: 'CU#7kR2@wQ9$',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-groups-editor',
    email: 'groups.editor@cu.ac.bd',
    fullName: 'Category Hierarchy Editor',
    department: 'Academic Section',
    role: 'MAINTENANCE_GROUPS',
    passwordPlain: 'CU#5vT8*bN1&',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];
