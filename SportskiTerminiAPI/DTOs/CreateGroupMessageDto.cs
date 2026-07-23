namespace SportskiTerminiAPI.DTOs
{
    public class CreateGroupMessageDto
    {
        public string MessageText { get; set; } = string.Empty;
        public int? ReplyToMessageId { get; set; }
    }
}
