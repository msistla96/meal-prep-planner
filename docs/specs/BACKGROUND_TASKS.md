# Background Task

## Purpose

This is to monitor grocery items that are expiring and keep track of what and when is it happening. This also serves as an alert for the user/agent and also a trigger for future actions like ordering grocery items when the list is close to done.

## How to setup

- Separate background process that is handed off to runtime/OS.
- Decide how should it run in the background without consuming memory.
- How often should it check the state of items?
    - How does it reconcile in case of failure?
    - Cache state and recheck or just do DB call and update?