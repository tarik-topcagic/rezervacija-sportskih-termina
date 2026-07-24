namespace SportsBookingAPI.Helpers
{
    public static class BosniaTimeHelper
    {
        private static readonly TimeZoneInfo SarajevoTimeZone = ResolveSarajevoTimeZone();

        public static DateTimeOffset ToSarajevoOffset(DateTime value)
        {
            var utcValue = value.Kind switch
            {
                DateTimeKind.Utc => value,
                DateTimeKind.Local => value.ToUniversalTime(),
                _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
            };

            var localTime = TimeZoneInfo.ConvertTimeFromUtc(utcValue, SarajevoTimeZone);
            return new DateTimeOffset(localTime, SarajevoTimeZone.GetUtcOffset(utcValue));
        }

        private static TimeZoneInfo ResolveSarajevoTimeZone()
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("Central European Standard Time");
            }
            catch (TimeZoneNotFoundException)
            {
                return TimeZoneInfo.FindSystemTimeZoneById("Europe/Sarajevo");
            }
        }
    }
}
