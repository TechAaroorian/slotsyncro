import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface BookingConfirmationEmailProps {
  guestName: string;
  hostName: string;
  eventTitle: string;
  date: string;
  time: string;
  meetingUrl?: string;
}

export const BookingConfirmationEmail = ({
  guestName = "Guest",
  hostName = "Host",
  eventTitle = "Meeting",
  date = "January 1, 2026",
  time = "10:00 AM",
  meetingUrl,
}: BookingConfirmationEmailProps) => {
  const previewText = `Your meeting with ${hostName} is confirmed!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-10 mx-auto p-5 w-116.25">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-7.5 mx-0">
              Meeting Confirmed
            </Heading>
            <Text className="text-black text-[14px] leading-6">
              Hi {guestName},
            </Text>
            <Text className="text-black text-[14px] leading-6">
              Your <strong>{eventTitle}</strong> with {hostName} has been
              successfully scheduled.
            </Text>

            <Section className="bg-[#f6f6f6] p-5 rounded-md mt-5 mb-5">
              <Text className="text-black text-[14px] leading-6 m-0">
                <strong>🗓 Date:</strong> {date}
              </Text>
              <Text className="text-black text-[14px] leading-6 m-0 mt-2">
                <strong>⏰ Time:</strong> {time}
              </Text>
              {meetingUrl && (
                <Text className="text-black text-[14px] leading-6 m-0 mt-2">
                  <strong>🔗 Location:</strong>{" "}
                  <a href={meetingUrl} className="text-blue-600 underline">
                    {meetingUrl}
                  </a>
                </Text>
              )}
            </Section>

            <Text className="text-black text-[14px] leading-6">
              A calendar invitation (.ics) has been attached to this email.
              Please add it to your calendar.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default BookingConfirmationEmail;
