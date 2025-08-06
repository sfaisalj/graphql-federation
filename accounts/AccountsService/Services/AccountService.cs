using AccountsService.Types;

namespace AccountsService.Services;

public class AccountService
{
    private readonly List<Account> _accounts = new()
    {
        new Account { Id = "1", Name = "John Doe", Email = "john@example.com" },
        new Account { Id = "2", Name = "Jane Smith", Email = "jane@example.com" },
        new Account { Id = "3", Name = "Bob Johnson", Email = "bob@example.com" }
    };

    public Account? GetAccountById(string id)
        => _accounts.FirstOrDefault(a => a.Id == id);

    public IEnumerable<Account> GetAllAccounts()
        => _accounts;
}