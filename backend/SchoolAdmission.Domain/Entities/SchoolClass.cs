namespace SchoolAdmission.Domain.Entities
{
    public class SchoolClass
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int TotalSeats { get; set; }
        public DateTimeOffset CreatedAt { get; set; }

        public ICollection<Hold> Holds { get; set; } = new List<Hold>();
    }
}