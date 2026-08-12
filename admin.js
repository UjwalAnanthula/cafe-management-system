/**
 * ============================================================
 * BEAN & BLOOM CAFÉ — ADMIN PORTAL JAVASCRIPT
 * Admin authentication & reservation management system
 *
 * Authentication: Firebase Auth (email/password)
 * Database: Firebase Firestore
 * Email: EmailJS
 * ============================================================
 */


/* ──────────────────────────────────────────────────────────
   0. BOOT
   Wait for Firebase SDKs / initialization before starting.
   ────────────────────────────────────────────────────────── */

function bootAdmin() {
  let attempts = 0;
  const maxAttempts = 100;

  const waitForFirebase = setInterval(() => {
    attempts++;

    let authInstance = null;

    try {
      authInstance =
        window.firebaseAuth ||
        window.auth ||
        (
          typeof firebase !== 'undefined' &&
          firebase.auth
            ? firebase.auth()
            : null
        );
    } catch (err) {
      console.warn('[Bean & Bloom] Firebase Auth not ready yet.');
    }

    if (
      authInstance &&
      typeof authInstance.onAuthStateChanged === 'function'
    ) {
      clearInterval(waitForFirebase);

      initAdminAuth(authInstance);
      initAdminDashboard();
    }

    if (attempts >= maxAttempts) {
      clearInterval(waitForFirebase);

      const fallbackAuth =
        window.firebaseAuth ||
        window.auth;

      if (!fallbackAuth) {
        showLoginError(
          'Firebase failed to load. Please refresh the page.'
        );
      }
    }
  }, 80);
}


if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootAdmin);
} else {
  bootAdmin();
}


/* ──────────────────────────────────────────────────────────
   1. ADMIN AUTHENTICATION
   Firebase Authentication — Email / Password
   ────────────────────────────────────────────────────────── */

function initAdminAuth(authInstance) {

  const loginSection =
    document.getElementById('admin-login-section');

  const dashSection =
    document.getElementById('admin-dashboard-section');

  const loginForm =
    document.getElementById('admin-login-form');

  const logoutBtn =
    document.getElementById('admin-logout-btn');

  const emailDisplay =
    document.getElementById('logged-admin-email');


  /* ── Authentication state ─────────────────────────────── */

  authInstance.onAuthStateChanged((user) => {

    if (user) {

      // User is authenticated
      if (emailDisplay) {
        emailDisplay.textContent =
          user.email || 'Administrator';
      }

      if (loginSection) {
        loginSection.hidden = true;
        loginSection.style.display = 'none';
      }

      if (dashSection) {
        dashSection.hidden = false;
        dashSection.style.display = 'block';
      }

      loadReservations();

    } else {

      // User is not authenticated
      if (loginSection) {
        loginSection.hidden = false;
        loginSection.style.display = 'flex';
      }

      if (dashSection) {
        dashSection.hidden = true;
        dashSection.style.display = 'none';
      }
    }
  });


  /* ── Login ─────────────────────────────────────────────── */

  if (loginForm) {

    loginForm.addEventListener('submit', async (e) => {

      e.preventDefault();

      const emailInput =
        document.getElementById('admin-email');

      const passInput =
        document.getElementById('admin-password');

      const submitBtn =
        document.getElementById('admin-login-submit');

      const btnText =
        submitBtn
          ? submitBtn.querySelector('.btn-text')
          : null;


      const email =
        emailInput
          ? emailInput.value.trim()
          : '';

      const password =
        passInput
          ? passInput.value
          : '';


      // Clear previous error
      const existingError =
        loginForm.querySelector('.form-error');

      if (existingError) {
        existingError.remove();
      }


      // Validation
      if (!email || !password) {
        showLoginError(
          'Please enter both admin email and password.'
        );
        return;
      }


      // Loading state
      if (btnText) {
        btnText.textContent = 'Verifying…';
      }

      if (submitBtn) {
        submitBtn.disabled = true;
      }


      try {

        await authInstance.signInWithEmailAndPassword(
          email,
          password
        );

        // onAuthStateChanged handles dashboard display

      } catch (err) {

        let message =
          'Access Denied: Invalid email or password.';

        switch (err.code) {

          case 'auth/invalid-email':
            message =
              'Please enter a valid email address.';
            break;

          case 'auth/user-disabled':
            message =
              'This admin account has been disabled.';
            break;

          case 'auth/too-many-requests':
            message =
              'Too many failed attempts. Please try again later.';
            break;

          case 'auth/network-request-failed':
            message =
              'Network error. Please check your connection.';
            break;

          case 'auth/invalid-credential':
          case 'auth/wrong-password':
          case 'auth/user-not-found':
            message =
              'Access Denied: Invalid email or password.';
            break;

          case 'auth/operation-not-allowed':
            message =
              'Email/password login is not enabled in Firebase.';
            break;
        }

        console.error(
          '[Bean & Bloom Admin Login Error]',
          err.code,
          err.message
        );

        showLoginError(message);

      } finally {

        if (btnText) {
          btnText.textContent = 'Log In to Portal';
        }

        if (submitBtn) {
          submitBtn.disabled = false;
        }
      }
    });
  }


  /* ── Logout ────────────────────────────────────────────── */

  if (logoutBtn) {

    logoutBtn.addEventListener('click', async () => {

      try {

        await authInstance.signOut();

        if (loginForm) {
          loginForm.reset();
        }

      } catch (err) {

        console.warn(
          '[Bean & Bloom] Sign-out error:',
          err.message
        );

      }
    });
  }
}


/* ──────────────────────────────────────────────────────────
   LOGIN ERROR
   ────────────────────────────────────────────────────────── */

function showLoginError(message) {

  const loginForm =
    document.getElementById('admin-login-form');

  if (!loginForm) return;

  const existingError =
    loginForm.querySelector('.form-error');

  if (existingError) {
    existingError.remove();
  }

  const errorElement =
    document.createElement('div');

  errorElement.className = 'form-error';
  errorElement.setAttribute('role', 'alert');
  errorElement.textContent = message;

  loginForm.appendChild(errorElement);
}


/* ──────────────────────────────────────────────────────────
   2. RESERVATION MANAGEMENT
   ────────────────────────────────────────────────────────── */

let allReservations = [];
let activeFilter = 'all';
let searchQuery = '';


function initAdminDashboard() {

  /* ── Filter tabs ───────────────────────────────────────── */

  const tabs =
    document.querySelectorAll('.admin-filter-tab');

  tabs.forEach(tab => {

    tab.addEventListener('click', () => {

      tabs.forEach(t => {
        t.classList.remove('active');
      });

      tab.classList.add('active');

      activeFilter =
        tab.getAttribute('data-filter') || 'all';

      renderTable();
    });
  });


  /* ── Search ────────────────────────────────────────────── */

  const searchInput =
    document.getElementById('admin-search');

  if (searchInput) {

    searchInput.addEventListener('input', (e) => {

      searchQuery =
        e.target.value
          .toLowerCase()
          .trim();

      renderTable();
    });
  }


  /* ── Reply modal ───────────────────────────────────────── */

  const cancelBtn =
    document.getElementById('modal-cancel-btn');

  const modal =
    document.getElementById('reply-modal');

  if (cancelBtn && modal) {

    cancelBtn.addEventListener('click', () => {
      modal.hidden = true;
    });
  }
}


/* ──────────────────────────────────────────────────────────
   3. LOAD RESERVATIONS
   Firestore + local backup
   ────────────────────────────────────────────────────────── */

function loadReservations() {

  const tbody =
    document.getElementById('bookings-tbody');

  if (tbody) {

    tbody.innerHTML = `
      <tr>
        <td colspan="7"
            style="text-align:center; padding:30px;">
          Fetching reservations…
        </td>
      </tr>
    `;
  }


  /* ── Local backup ──────────────────────────────────────── */

  let localData = [];

  try {

    /*
     * IMPORTANT:
     * This key must match the key used by main.js.
     */
    localData =
      JSON.parse(
        localStorage.getItem(
          'bean_bloom_reservations'
        ) || '[]'
      );

    localData =
      localData.map((item, index) => ({

        id:
          item.reservationId ||
          'local_' +
          (item.createdAt || index),

        isLocal: true,

        ...item

      }));

  } catch (err) {

    console.warn(
      '[Bean & Bloom] LocalStorage read error:',
      err
    );

  }


  /* ── Firestore ─────────────────────────────────────────── */

  let dbInstance = null;

  try {

    dbInstance =
      window.db ||
      window.firebaseDb ||
      (
        typeof db !== 'undefined'
          ? db
          : null
      );

  } catch (err) {

    console.warn(
      '[Bean & Bloom] Firestore reference unavailable:',
      err
    );

  }


  /*
   * Check Firestore availability
   */

  if (
    !dbInstance ||
    typeof dbInstance.collection !== 'function'
  ) {

    console.error(
      '[Bean & Bloom] Firestore is not initialized.'
    );

    allReservations = localData;

    updateStats();
    renderTable();

    showToast(
      'Firestore is not connected. Showing local reservations.',
      'error'
    );

    return;
  }


  /*
   * ─────────────────────────────────────────────────────────
   * FIRESTORE REAL-TIME LISTENER
   * ─────────────────────────────────────────────────────────
   */

  dbInstance
    .collection('reservations')
    .onSnapshot(

      snapshot => {

        const remoteData = [];

        snapshot.forEach(doc => {

          remoteData.push({

            id: doc.id,

            ...doc.data()

          });

        });


        console.log(
          '[Bean & Bloom] Firestore reservations loaded:',
          remoteData.length
        );


        /*
         * ───────────────────────────────────────────────────
         * MERGE LOCAL + FIRESTORE
         * Firestore takes priority.
         * ───────────────────────────────────────────────────
         */

        const mergedMap =
          new Map();


        /*
         * Add local reservations first.
         */

        localData.forEach(item => {

          const key =
            (
              item.reservationId ||
              item.id ||
              item.email +
              '_' +
              item.date +
              '_' +
              item.time
            );

          mergedMap.set(
            key,
            item
          );

        });


        /*
         * Add Firestore reservations.
         * These override matching local records.
         */

        remoteData.forEach(item => {

          const key =
            item.reservationId ||
            item.id ||
            (
              item.email +
              '_' +
              item.date +
              '_' +
              item.time
            );

          mergedMap.set(
            key,
            item
          );

        });


        /*
         * Convert Map to array.
         */

        allReservations =
          Array.from(
            mergedMap.values()
          );


        /*
         * Newest first
         */

        allReservations.sort(
          (a, b) => {

            const dateA =
              new Date(
                a.createdAt || 0
              ).getTime();

            const dateB =
              new Date(
                b.createdAt || 0
              ).getTime();

            return dateB - dateA;

          }
        );


        console.log(
          '[Bean & Bloom] Total reservations:',
          allReservations.length
        );


        updateStats();
        renderTable();

      },


      /*
       * ─────────────────────────────────────────────────────
       * FIRESTORE ERROR
       * ─────────────────────────────────────────────────────
       */

      error => {

        console.error(
          '❌ [Bean & Bloom] Firestore listener error:',
          error
        );

        console.error(
          'Firestore error code:',
          error.code
        );

        console.error(
          'Firestore error message:',
          error.message
        );


        /*
         * IMPORTANT:
         * Do not silently hide the error.
         */

        allReservations =
          localData;


        updateStats();
        renderTable();


        if (
          error.code ===
          'permission-denied'
        ) {

          showToast(
            'Firestore access denied. Check that you are logged in with the authorized admin account.',
            'error'
          );

        } else {

          showToast(
            'Could not load reservations from Firebase.',
            'error'
          );

        }

      }

    );

}

/* ──────────────────────────────────────────────────────────
   4. DASHBOARD STATISTICS
   ────────────────────────────────────────────────────────── */

function updateStats() {

  const totalEl =
    document.getElementById('stat-total');

  const pendingEl =
    document.getElementById('stat-pending');

  const confirmedEl =
    document.getElementById('stat-confirmed');

  const guestsEl =
    document.getElementById('stat-guests');


  const total =
    allReservations.length;


  const pending =
    allReservations.filter(
      reservation =>
        (
          reservation.status ||
          'Pending'
        ).toLowerCase() === 'pending'
    ).length;


  const confirmed =
    allReservations.filter(
      reservation =>
        (
          reservation.status ||
          ''
        ).toLowerCase() === 'confirmed'
    ).length;


  const guests =
    allReservations.reduce(
      (sum, reservation) =>
        sum +
        (
          parseInt(
            reservation.guests,
            10
          ) || 2
        ),
      0
    );


  if (totalEl) {
    totalEl.textContent = total;
  }

  if (pendingEl) {
    pendingEl.textContent = pending;
  }

  if (confirmedEl) {
    confirmedEl.textContent = confirmed;
  }

  if (guestsEl) {
    guestsEl.textContent = guests;
  }
}


/* ──────────────────────────────────────────────────────────
   5. RESERVATION TABLE
   ────────────────────────────────────────────────────────── */

function renderTable() {

  const tbody =
    document.getElementById('bookings-tbody');

  if (!tbody) return;


  const filtered =
    allReservations.filter(reservation => {

      /* Status filter */

      const status =
        (
          reservation.status ||
          'Pending'
        ).toLowerCase();

      if (
        activeFilter !== 'all' &&
        status !== activeFilter.toLowerCase()
      ) {
        return false;
      }


      /* Search */

      if (searchQuery) {

        const name =
          (
            reservation.customerName ||
            reservation.name ||
            ''
          ).toLowerCase();

        const email =
          (
            reservation.email ||
            ''
          ).toLowerCase();

        const phone =
          (
            reservation.phone ||
            ''
          ).toLowerCase();


        if (
          !name.includes(searchQuery) &&
          !email.includes(searchQuery) &&
          !phone.includes(searchQuery)
        ) {
          return false;
        }
      }


      return true;
    });


  if (filtered.length === 0) {

    tbody.innerHTML = `
      <tr>
        <td colspan="7"
            style="
              text-align:center;
              padding:48px;
              color:var(--warm-gray);
            ">
          No reservations found matching your criteria.
        </td>
      </tr>
    `;

    return;
  }


  tbody.innerHTML =
    filtered
      .map(reservation => {

        const rawStatus =
          reservation.status ||
          'Pending';

        const statusLower =
          rawStatus.toLowerCase();

        const statusClass =
          `status--${statusLower}`;


        const timeFormatted =
          formatTime(reservation.time);


        const emailStatus =
          reservation.emailStatus ||
          'Pending';

        const emailStatusLower =
          emailStatus.toLowerCase();


        const emailBadgeClass =
          `email-badge--${
            emailStatusLower === 'failed'
              ? 'failed'
              : emailStatusLower === 'pending'
                ? 'pending'
                : 'sent'
          }`;


        const guestName =
          reservation.customerName ||
          reservation.name ||
          'Guest';


        const notesText =
          reservation.specialRequest ||
          reservation.notes ||
          '';


        return `
          <tr data-id="${escapeHtml(reservation.id || '')}">

            <td>

              <div style="
                font-weight:600;
                color:var(--bark);
              ">
                ${escapeHtml(guestName)}
              </div>

              <div style="
                font-size:12px;
                color:var(--warm-gray);
              ">
                ${escapeHtml(reservation.email || '')}
              </div>

              ${
                reservation.phone
                  ? `
                    <div style="
                      font-size:12px;
                      color:var(--coffee-mid);
                    ">
                      ${escapeHtml(reservation.phone)}
                    </div>
                  `
                  : ''
              }

              ${
                reservation.reservationId
                  ? `
                    <div style="
                      font-size:11px;
                      color:var(--coffee);
                      font-family:monospace;
                    ">
                      ID:
                      ${escapeHtml(
                        reservation.reservationId
                      )}
                    </div>
                  `
                  : ''
              }

            </td>


            <td>

              <div style="font-weight:500;">
                ${escapeHtml(
                  reservation.date || 'TBD'
                )}
              </div>

              <div style="
                font-size:12px;
                color:var(--coffee-mid);
              ">
                ${escapeHtml(timeFormatted)}
              </div>

            </td>


            <td style="
              font-weight:600;
              text-align:center;
            ">
              ${escapeHtml(
                String(reservation.guests || 2)
              )}
            </td>


            <td style="
              max-width:180px;
              font-size:13px;
              color:var(--coffee-mid);
            ">

              ${
                notesText
                  ? escapeHtml(notesText)
                  : `
                    <span style="
                      color:#A08070;
                      font-style:italic;
                    ">
                      None
                    </span>
                  `
              }

            </td>


            <td>

              <span class="
                status-badge
                ${statusClass}
              ">

                <span style="
                  display:inline-block;
                  width:6px;
                  height:6px;
                  border-radius:50%;
                  background:currentColor;
                "></span>

                ${escapeHtml(rawStatus)}

              </span>

            </td>


            <td>

              <span class="
                email-badge
                ${emailBadgeClass}
              ">
                ${escapeHtml(emailStatus)}
              </span>

            </td>


            <td>

              <div class="action-btn-group">

                ${
                  statusLower !== 'confirmed'
                    ? `
                      <button
                        type="button"
                        class="
                          btn-action
                          btn-action--approve
                        "
                        onclick="updateBookingStatus(
                          '${escapeJs(reservation.id)}',
                          'Confirmed'
                        )"
                      >
                        Confirm
                      </button>
                    `
                    : ''
                }


                ${
                  statusLower !== 'cancelled'
                    ? `
                      <button
                        type="button"
                        class="
                          btn-action
                          btn-action--cancel
                        "
                        onclick="updateBookingStatus(
                          '${escapeJs(reservation.id)}',
                          'Cancelled'
                        )"
                      >
                        Cancel
                      </button>
                    `
                    : ''
                }


                <button
                  type="button"
                  class="
                    btn-action
                    btn-action--reply
                  "
                  onclick="openReplyModal(
                    '${escapeJs(reservation.id)}'
                  )"
                >
                  Reply
                </button>


                <button
                  type="button"
                  class="
                    btn-action
                    btn-action--delete
                  "
                  onclick="deleteBooking(
                    '${escapeJs(reservation.id)}'
                  )"
                  aria-label="Delete reservation"
                >
                  ✕
                </button>

              </div>

            </td>

          </tr>
        `;
      })
      .join('');
}


/* ──────────────────────────────────────────────────────────
   6. ADMIN TOAST
   ────────────────────────────────────────────────────────── */

function showToast(message, type = 'info') {

  const container =
    document.getElementById('toast-container');

  if (!container) return;


  const toast =
    document.createElement('div');

  toast.className =
    `toast toast-${type}`;


  const iconMap = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };


  toast.innerHTML = `
    <span style="font-weight:bold;">
      ${iconMap[type] || 'ℹ'}
    </span>

    <span>
      ${escapeHtml(message)}
    </span>
  `;


  container.appendChild(toast);


  setTimeout(() => {

    toast.style.opacity = '0';
    toast.style.transform =
      'translateY(10px)';

    toast.style.transition =
      'opacity 0.3s, transform 0.3s';


    setTimeout(() => {
      toast.remove();
    }, 300);

  }, 4000);
}


/* ──────────────────────────────────────────────────────────
   6.5. EMAILJS STATUS EMAIL
   Sends Confirmed / Cancelled emails to the customer.
   ────────────────────────────────────────────────────────── */

function sendStatusEmail(
  reservation,
  status,
  docId
) {

  const cfg = window.EMAILJS_CONFIG;

  /* Check EmailJS */
  if (
    !cfg ||
    !cfg.serviceId ||
    !cfg.templateId ||
    typeof emailjs === 'undefined'
  ) {

    console.error(
      '[Bean & Bloom] EmailJS is not configured.'
    );

    showToast(
      'EmailJS is not configured. Status was updated, but email was not sent.',
      'error'
    );

    return Promise.resolve({
      sent: false,
      status: 'SKIPPED'
    });
  }


  /* Customer email */
  const customerEmail =
    reservation.email || '';


  if (!customerEmail) {

    console.warn(
      '[Bean & Bloom] No customer email found for reservation.'
    );

    showToast(
      'Reservation has no customer email address.',
      'error'
    );

    return Promise.resolve({
      sent: false,
      status: 'NO_EMAIL'
    });
  }


  /* Customer name */
  const customerName =
    reservation.customerName ||
    reservation.name ||
    'Valued Guest';


  /* Reservation ID */
  const reservationId =
    reservation.reservationId ||
    reservation.id ||
    docId ||
    'N/A';


  /* Normalize status */
  const normalizedStatus =
    String(status || '')
      .toLowerCase();


  /* Subject + message */
  let subject = '';
  let message = '';


  if (normalizedStatus === 'confirmed') {

    subject =
      'Your Reservation is Confirmed — Bean & Bloom Café';

    message =
      'Great news! Your reservation has been confirmed by our team. We can’t wait to welcome you to Bean & Bloom Café!';

  } else if (normalizedStatus === 'cancelled') {

    subject =
      'Your Reservation Has Been Cancelled — Bean & Bloom Café';

    message =
      'We’re sorry to let you know that your reservation has been cancelled. Please contact Bean & Bloom Café if you would like to reschedule.';

  } else {

    console.warn(
      '[Bean & Bloom] No status email configured for:',
      status
    );

    return Promise.resolve({
      sent: false,
      status: 'NOT_REQUIRED'
    });
  }


  /* EmailJS template parameters */
  const templateParams = {

    /* Recipient */
    to_email:
      customerEmail,

    reply_to:
      customerEmail,

    /* Customer */
    customer_name:
      customerName,

    email:
      customerEmail,


    /* Reservation */
    reservation_id:
      reservationId,

    date:
      reservation.date ||
      'TBD',

    time:
      formatTime(
        reservation.time
      ) ||
      reservation.time ||
      'TBD',

    guests:
      String(
        reservation.guests || 2
      ),

    phone:
      reservation.phone ||
      'Not provided',

    special_request:
      reservation.specialRequest ||
      reservation.notes ||
      'None',

    /* Status */
    status:
      normalizedStatus,


    /* Email content */
    subject:
      subject,

    message:
      message,

    message_body:
      message,


    /* Café information */
    cafe_name:
      'Bean & Bloom Café',

    cafe_address:
      '12, Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',

    cafe_phone:
      '+91 40 4852 7190',

    cafe_email:
      'hello@beanandbloomcafe.com',

    cafe_instagram:
      '@beanandbloomcafe',

    cafe_hours:
      '8 AM – 10 PM',

    cafe_city:
      'Hyderabad',

    cafe_area:
      'Jubilee Hills',

    maps_link:
      'https://maps.google.com/?q=12+Road+No+36+Jubilee+Hills+Hyderabad'
  };

  console.log(
    `[EmailJS] Sending ${normalizedStatus} email to:`,
    customerEmail
  );


  /* Send email */
  return emailjs
    .send(
      cfg.serviceId,
      cfg.templateId,
      templateParams
    )

    .then(response => {

      console.log(
        `✅ [EmailJS] ${normalizedStatus} email sent to ${customerEmail}`,
        response.status,
        response.text
      );


      showToast(
        `Email sent to ${customerEmail} ✓`,
        'success'
      );


      return {
        sent: true,
        status: 'Sent',
        response: response
      };

    })

    .catch(error => {

      console.error(
        `❌ [EmailJS] Failed to send ${normalizedStatus} email:`,
        error
      );


      showToast(
        'Reservation status updated, but email failed to send.',
        'error'
      );


      return {
        sent: false,
        status: 'Failed',
        error: error
      };
    });
}

/* ──────────────────────────────────────────────────────────
   7. UPDATE RESERVATION STATUS
   ────────────────────────────────────────────────────────── */

window.updateBookingStatus =
  function (id, newStatus) {

    /*
     * Firestore rules expect:
     *
     * pending
     * confirmed
     * cancelled
     *
     * Convert whatever comes from the button
     * into the correct lowercase value.
     */

    const normalizedStatus =
      String(newStatus || '')
        .toLowerCase();


    const allowedStatuses = [
      'pending',
      'confirmed',
      'cancelled'
    ];


    if (
      !allowedStatuses.includes(
        normalizedStatus
      )
    ) {

      console.error(
        '[Bean & Bloom] Invalid reservation status:',
        newStatus
      );

      showToast(
        'Invalid reservation status.',
        'error'
      );

      return;
    }


    const item =
      allReservations.find(
        reservation =>
          reservation.id === id
      );


    if (!item) {

      showToast(
        'Reservation could not be found.',
        'error'
      );

      return;
    }


    const nowIso =
      new Date().toISOString();


    /*
     * ── Update local object ───────────────────────────────
     */

    item.status =
      normalizedStatus;

    item.updatedAt =
      nowIso;


    /*
     * ── LocalStorage ──────────────────────────────────────
     */

    try {

      let local =
        JSON.parse(
          localStorage.getItem(
            'bean_bloom_reservations'
          ) || '[]'
        );


      local.forEach(
        reservation => {

          if (

            (
              reservation.email ===
                item.email ||

              reservation.reservationId ===
                item.reservationId

            ) &&

            reservation.date ===
              item.date &&

            reservation.time ===
              item.time

          ) {

            reservation.status =
              normalizedStatus;

            reservation.updatedAt =
              nowIso;

          }

        }
      );


      localStorage.setItem(
        'bean_bloom_reservations',
        JSON.stringify(local)
      );


    } catch (err) {

      console.warn(
        '[Bean & Bloom] Local status update error:',
        err
      );

    }


    /*
     * ── Firestore ─────────────────────────────────────────
     */

    let dbInstance = null;


    try {

      dbInstance =
        window.db ||
        window.firebaseDb ||
        (
          typeof db !== 'undefined'
            ? db
            : null
        );

    } catch (err) {

      console.warn(
        '[Bean & Bloom] Firestore reference unavailable:',
        err
      );

    }


    if (

      dbInstance &&

      typeof dbInstance.collection ===
        'function' &&

      id &&

      !String(id).startsWith('local_')

    ) {


      dbInstance
        .collection('reservations')
        .doc(id)
        .update({

          status:
            normalizedStatus,

          updatedAt:
            nowIso

        })


        .then(() => {

          console.log(
            '✅ Reservation status updated in Firestore:',
            normalizedStatus
          );


          /*
           * Send status email.
           * The email function already handles
           * Confirmed / Cancelled.
           */

          const emailStatus =
            normalizedStatus === 'confirmed'
              ? 'Confirmed'
              : normalizedStatus === 'cancelled'
                ? 'Cancelled'
                : normalizedStatus;


          if (
            emailStatus === 'Confirmed' ||
            emailStatus === 'Cancelled'
          ) {

            sendStatusEmail(
              item,
              emailStatus,
              id
            );

          }


          showToast(
            `Reservation ${normalizedStatus}.`,
            'success'
          );

        })


        .catch(error => {

          console.error(
            '❌ [Bean & Bloom] Firestore status update error:',
            error
          );


          /*
           * Revert local object if Firestore failed.
           */

          /*
           * We don't know the exact previous value here,
           * so reload reservations from Firestore/local
           * rather than pretending the update succeeded.
           */

          showToast(
            'Could not update reservation in Firebase.',
            'error'
          );


          loadReservations();

        });


    } else {


      /*
       * Local-only reservation.
       */

      const emailStatus =
        normalizedStatus === 'confirmed'
          ? 'Confirmed'
          : normalizedStatus === 'cancelled'
            ? 'Cancelled'
            : normalizedStatus;


      if (
        emailStatus === 'Confirmed' ||
        emailStatus === 'Cancelled'
      ) {

        sendStatusEmail(
          item,
          emailStatus,
          id
        );

      }


      showToast(
        `Status updated to ${normalizedStatus}.`,
        'info'
      );

    }


    updateStats();
    renderTable();

  };


/* ──────────────────────────────────────────────────────────
   9. DELETE RESERVATION
   ────────────────────────────────────────────────────────── */

window.deleteBooking =
  function (id) {

    if (
      !confirm(
        'Are you sure you want to remove this reservation?'
      )
    ) {
      return;
    }


    const item =
      allReservations.find(
        reservation =>
          reservation.id === id
      );


    allReservations =
      allReservations.filter(
        reservation =>
          reservation.id !== id
      );


    /* ── Remove local record ─────────────────────────────── */

    try {

      let local =
        JSON.parse(
          localStorage.getItem(
            'beanandbloom_reservations'
          ) || '[]'
        );


      if (item) {

        local =
          local.filter(reservation => {

            return !(
              reservation.email === item.email &&
              reservation.date === item.date &&
              reservation.time === item.time
            );
          });
      }


      localStorage.setItem(
        'beanandbloom_reservations',
        JSON.stringify(local)
      );

    } catch (err) {

      console.warn(
        '[Bean & Bloom] Local delete error:',
        err
      );
    }


    /* ── Remove Firestore record ─────────────────────────── */

    let dbInstance = null;

    try {

      dbInstance =
        window.db ||
        window.firebaseDb ||
        (
          typeof db !== 'undefined'
            ? db
            : null
        );

    } catch (err) {}


    if (
      dbInstance &&
      typeof dbInstance.collection === 'function' &&
      id &&
      !String(id).startsWith('local_')
    ) {

      dbInstance
        .collection('reservations')
        .doc(id)
        .delete()
        .catch(error => {

          console.warn(
            '[Bean & Bloom] Firestore delete error:',
            error
          );
        });
    }


    updateStats();
    renderTable();

    showToast(
      'Reservation removed.',
      'success'
    );
  };


/* ──────────────────────────────────────────────────────────
   10. REPLY MODAL
   ────────────────────────────────────────────────────────── */

let currentReplyResId = null;


window.openReplyModal =
  function (id) {

    const reservation =
      allReservations.find(
        item => item.id === id
      );

    if (!reservation) return;


    currentReplyResId = id;


    const modal =
      document.getElementById('reply-modal');

    const emailInput =
      document.getElementById(
        'modal-guest-email'
      );

    const subjectInput =
      document.getElementById(
        'modal-subject'
      );

    const messageInput =
      document.getElementById(
        'modal-message'
      );


    if (emailInput) {
      emailInput.value =
        reservation.email || '';
    }


    if (subjectInput) {

      subjectInput.value =
        'A Message from Bean & Bloom Café';
    }


    if (messageInput) {

      const isCancelled =
        (
          reservation.status || ''
        ).toLowerCase() === 'cancelled';


      const statusText =
        isCancelled
          ? 'update regarding your table request'
          : 'confirmation for your table reservation';


      messageInput.value =
`Dear ${
  reservation.customerName ||
  reservation.name ||
  'Valued Guest'
},

Thank you for choosing Bean & Bloom Café!

This is an official ${statusText} for ${
  reservation.date ||
  'your requested date'
} at ${
  formatTime(reservation.time) ||
  reservation.time ||
  'your requested time'
} for ${
  reservation.guests ||
  2
} guest(s).

If you have any questions or need to make changes, please contact Bean & Bloom Café.

Warm regards,
Bean & Bloom Café Team`;
    }


    if (modal) {
      modal.hidden = false;
      modal.setAttribute(
        'aria-hidden',
        'false'
      );
    }
  };


/* ──────────────────────────────────────────────────────────
   11. REPLY MODAL SEND / CLOSE
   ────────────────────────────────────────────────────────── */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    const modal =
      document.getElementById(
        'reply-modal'
      );

    const cancelBtn =
      document.getElementById(
        'modal-cancel-btn'
      );

    const sendBtn =
      document.getElementById(
        'modal-send-btn'
      );


    /* Close */

    if (cancelBtn) {

      cancelBtn.addEventListener(
        'click',
        () => {

          if (modal) {
            modal.hidden = true;
            modal.setAttribute(
              'aria-hidden',
              'true'
            );
          }
        }
      );
    }


    /* Send */

    if (sendBtn) {

      sendBtn.addEventListener(
        'click',
        () => {

          const email =
            document
              .getElementById(
                'modal-guest-email'
              )
              ?.value
              ?.trim() || '';


          const body =
            document
              .getElementById(
                'modal-message'
              )
              ?.value
              ?.trim() || '';


          const subject =
            document
              .getElementById(
                'modal-subject'
              )
              ?.value
              ?.trim() ||
            'A Message from Bean & Bloom Café';


          if (!email) {

            showToast(
              'No recipient email found.',
              'error'
            );

            return;
          }


          if (!body) {

            showToast(
              'Please enter a message.',
              'error'
            );

            return;
          }


          const cfg =
            window.EMAILJS_CONFIG;

          if (
            !cfg ||
            !cfg.publicKey ||
            !cfg.serviceId ||
            !cfg.templateId ||
            typeof emailjs === 'undefined'
          ) {

            showToast(
              'EmailJS is not configured. Please set up the EmailJS credentials.',
              'error'
            );

            return;
          }


          const reservation =
            currentReplyResId
              ? allReservations.find(
                  item =>
                    item.id ===
                    currentReplyResId
                )
              : null;


          if (!reservation) {

            showToast(
              'Reservation could not be found.',
              'error'
            );

            return;
          }


          sendBtn.textContent =
            'Sending…';

          sendBtn.disabled = true;


          const templateParams = {

            to_email:
              email,

            customer_name:
              reservation.customerName ||
              reservation.name ||
              'Valued Guest',

            reservation_id:
              reservation.reservationId ||
              reservation.id ||
              'N/A',

            date:
              reservation.date ||
              'TBD',

            time:
              formatTime(
                reservation.time
              ) ||
              reservation.time ||
              'TBD',

            guests:
              String(
                reservation.guests || 2
              ),

            special_request:
              reservation.specialRequest ||
              reservation.notes ||
              'None',

            subject:
              subject,

            message_body:
              body,

            cafe_address:
              'Bean & Bloom Café',

            cafe_phone:
              '',

            maps_link:
              ''
          };


          emailjs
            .send(
              cfg.serviceId,
              cfg.templateId,
              templateParams
            )

            .then(() => {

              showToast(
                `Email sent to ${email} ✓`,
                'success'
              );


              if (modal) {

                modal.hidden = true;

                modal.setAttribute(
                  'aria-hidden',
                  'true'
                );
              }
            })

            .catch(error => {

              console.warn(
                '[Bean & Bloom EmailJS Reply Error]',
                error
              );

              showToast(
                'Email failed to send. Please check EmailJS credentials.',
                'error'
              );
            })

            .finally(() => {

              sendBtn.textContent =
                'Send Email';

              sendBtn.disabled =
                false;
            });
        }
      );
    }
  }
);


/* ──────────────────────────────────────────────────────────
   12. UTILITIES
   ────────────────────────────────────────────────────────── */

function formatTime(timeStr) {

  if (!timeStr) {
    return '';
  }


  timeStr =
    String(timeStr).trim();


  /* Already formatted */

  if (
    timeStr.includes(':') &&
    (
      timeStr.toLowerCase().includes('am') ||
      timeStr.toLowerCase().includes('pm')
    )
  ) {
    return timeStr;
  }


  /* HHMM */

  if (
    /^\d{4}$/.test(timeStr)
  ) {

    const hours =
      parseInt(
        timeStr.slice(0, 2),
        10
      );

    const minutes =
      timeStr.slice(2);


    const period =
      hours >= 12
        ? 'PM'
        : 'AM';


    const displayHours =
      hours % 12 || 12;


    return `${displayHours}:${minutes} ${period}`;
  }


  return timeStr;
}


/* ──────────────────────────────────────────────────────────
   HTML ESCAPING
   ────────────────────────────────────────────────────────── */

function escapeHtml(value) {

  if (value === null || value === undefined) {
    return '';
  }


  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


/* ──────────────────────────────────────────────────────────
   JAVASCRIPT STRING ESCAPING
   Used for inline onclick IDs.
   ────────────────────────────────────────────────────────── */

function escapeJs(value) {

  if (value === null || value === undefined) {
    return '';
  }


  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');
}