namespace SportskiTerminiAPI.DTOs
{
    public class MessageDeletedDto
    {
        public int MessageId { get; set; }
        public int? GroupId { get; set; }
        public int? ConversationId { get; set; }
    }
}
