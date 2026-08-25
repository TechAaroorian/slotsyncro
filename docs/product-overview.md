# Product Overview

**Document status:** Initial draft  
**Scope:** Current product and proposed direction

## Product summary

SlotSyncro is a scheduling and group-decision application. It currently supports individual booking links, recurring host availability, booking confirmation emails with calendar invitations, and group availability polls.

The proposed direction is to connect those capabilities into one coherent workflow for distributed groups:

```text
Suggest candidate times
  -> collect preferences
  -> recommend a fair option
  -> finalize the decision
  -> create the meeting
  -> notify participants
  -> manage the meeting lifecycle
```

## Product vision

> Help individuals and distributed groups reach a reliable, fair scheduling decision with less coordination effort.

SlotSyncro should support two complementary scheduling modes:

1. **Direct booking:** one invitee selects an available time offered by a host.
2. **Consensus scheduling:** several participants express preferences before a host or decision rule finalizes the meeting.

These modes should converge on the same meeting lifecycle rather than behaving as separate products.

## Initial target users

### Primary proposed segment

Distributed teams that schedule multi-person or recurring meetings across timezones.

Their common problems include:

- The same region repeatedly receiving inconvenient meeting times.
- Required and optional participants being treated equally.
- Poll results showing popularity without explaining fairness.
- Proposed times becoming unavailable while voting is open.
- Manual work between closing a poll and sending the final invitation.

### Secondary segments

- Interview panels
- Open-source communities
- University and research groups
- International volunteer organizations
- Committees that require quorum or specific roles

These are candidate user groups, not commitments to support every scenario at once.

## Current value proposition

**Current:** A host can configure availability and event types, share a public booking link, receive a booking, and send a guest an email confirmation with an ICS attachment. A signed-in user can also create a simple availability poll and share it for voting.

## Proposed differentiated value proposition

> Calendars tell people when they are free. SlotSyncro helps a group decide which available time is fairest and turns that decision into a confirmed meeting.

The intended differentiation is not the existence of a poll. It is the connection between availability, participant importance, timezone burden, explainable consensus, and final meeting commitment.

## Product principles

### 1. Decisions must lead to outcomes

A poll is incomplete until the selected time becomes a managed meeting and participants receive a definitive result.

### 2. Fairness should be explainable

If the product recommends a time, it should show the factors that produced the recommendation. Avoid unexplained scores or decorative AI labels.

### 3. Timezones are domain data

Store event instances as absolute timestamps, retain the timezone context used to create schedules, and display times in the viewer's timezone with an explicit label.

### 4. External failures must not rewrite business truth

A failed email must not make a successfully created booking appear absent. Database state, notification state, and external provider state should be represented independently.

### 5. Simple for individuals, extensible for teams

Individuals should not be forced to understand workspaces, roles, or routing. The proposed data model may support those concepts while the initial interface remains personal.

### 6. Privacy before convenience

Calendar integrations should request the minimum scopes required. Free/busy checks should not expose calendar event details to other participants.

### 7. Build vertical journeys

Prefer completing an end-to-end user outcome over implementing several disconnected backend capabilities.

## Product terminology

| Term | Meaning |
| --- | --- |
| **User** | A person with a SlotSyncro account. |
| **Host** | The user responsible for a booking link, poll, or meeting. |
| **Guest** | A person using a direct-booking link. An account is not required. |
| **Participant** | A person invited to or responding to a group poll or meeting. |
| **Event type** | A reusable direct-booking configuration such as duration, title, buffers, and public slug. |
| **Booking** | The current record produced when a guest reserves an event type. Its long-term relationship to `Meeting` remains a proposed design decision. |
| **Poll** | A group decision process containing candidate times and participant responses. |
| **Candidate time** | A possible start and end time offered in a poll. The current database calls this `TimeSlot`. |
| **Vote** | One participant's preference for one candidate time. The current database calls this `Availability`. |
| **Meeting** | **Proposed:** the final scheduled commitment produced by direct booking or poll finalization. |
| **Workspace** | **Proposed:** a personal or team tenancy boundary containing resources and memberships. |

## Product boundaries

### In the intended product boundary

- Direct booking
- Availability management
- Group polling
- Poll finalization
- Timezone-aware recommendations
- Calendar invitations
- Notifications
- Cancellation and rescheduling
- External calendar free/busy integration
- Personal and later team workspaces

### Not an initial goal

- Building a video-conferencing platform
- Building a complete CRM
- Employee productivity monitoring
- Supporting dozens of integrations before one calendar integration is reliable
- Native mobile applications before the web product is validated
- Adding generative AI without a specific scheduling outcome

## Success measures

Metrics will be refined as the product matures. Useful product measures include:

- Percentage of created polls that become finalized meetings
- Median time from poll creation to finalization
- Participant response rate
- Number of manual reminders required
- Percentage of recommended slots accepted by hosts
- Meetings scheduled without a participant outside configured working hours
- Direct-booking completion rate
- Notification delivery success rate
- Cancellation and rescheduling rate

These metrics should be collected only when there is a clear product decision they can inform.

## Open product decisions

- Should `Booking` become the universal scheduled event, or should both bookings and polls produce a separate `Meeting` entity?
- When should a personal workspace be introduced into the implemented schema?
- Does a poll require invited participants, or can it also remain open to anyone with the link?
- Can participants suggest candidate times, and who approves them?
- Who may finalize a poll: only its creator, workspace administrators, or an automatic policy?
- How is timezone inconvenience calculated and accumulated for recurring meetings?
- Which first calendar provider should be integrated?

Open decisions are intentionally unresolved until use cases and the domain model are documented.

