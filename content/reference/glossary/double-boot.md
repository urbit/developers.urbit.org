+++
title = "Double-boot"

[extra]
category = "arvo"
+++

**Double-booting** is when you have a second, older copy of your
[pier](/reference/glossary/pier) and spin it up on the live network. This
creates irreparable networking problems and requires you to perform a [factory
reset](/reference/glossary/reset).

[Ames](/reference/glossary/ames) (Urbit's networking protocol) has the unique
property of "exactly-once messaging", meaning it guarantees a message sent to
another ship will be delivered once, and once only. This property is highly
desirable and greatly simplifies writing networked applications, but it requires
that the ordering and receipt of every single message to every ship is carefully
tracked by Ames.

When an older copy of a ship is booted, it will not know about the newer
messages it has sent and received, so will be out of sync with the remote ships
it's communicating with. The remote ships will not resend messages they know to
have already been delivered, your ship will reject their new messages because
there will be a gap in the sequence, and the remote ship will refuse the
messages you send because of reused message numbers. This situation cannot be
fixed, and will create permanent networking issues with those ships. We
therefore recommend you don't keep multiple copies of your pier lying around,
and take great care to never boot an old copy if you do.

### Further Reading

- [Guide to Factory
  Resets](https://operators.urbit.org/manual/id/guide-to-resets): How to perform
  a factory reset through Bridge if you accidentally double-boot your ship.
