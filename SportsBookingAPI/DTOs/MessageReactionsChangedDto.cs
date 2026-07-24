namespace SportsBookingAPI.DTOs
{
    public class MessageReactionsChangedDto
    {
        public int MessageId { get; set; }
        public int? GroupId { get; set; }
        public int? ConversationId { get; set; }
        public List<MessageReactionDto> Reactions { get; set; } = new();
    }
}
