import bcrypt from "bcryptjs";

// bcrypt is a one-way hash, not encryption — there is no key that decrypts
// a hash back into the original password, so a stolen DB row never reveals
// the plaintext.
//
// hashSync(password, rounds):
//   1. Generates a random 16-byte salt.
//   2. Runs the Blowfish-based bcrypt algorithm over `salt + password` for
//      2^rounds iterations, so brute-forcing a leaked hash is intentionally
//      slow (this is the whole point vs. a fast hash like SHA-256).
//   3. Encodes salt + cost + resulting hash into one string:
//      $2a$<rounds>$<22-char salt><31-char hash>
//      That string is the only thing we store — the salt travels with it,
//      so no separate salt column is needed.
const SALT_ROUNDS = 10;

export function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

// compareSync re-extracts the salt and cost from `hash`, reruns the same
// bcrypt computation over `password`, and does a constant-time comparison
// against the stored hash — constant-time so response latency can't leak
// how many characters matched.
export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}
