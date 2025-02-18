using SportskiTerminiAPI.Models;

namespace SportskiTerminiAPI.Interfaces
{
    public interface IGradRepository
    {
        Task<IEnumerable<Grad>> GetAllGradoviAsync();
        Task<Grad> AddGradAsync(Grad grad);
    }
}
