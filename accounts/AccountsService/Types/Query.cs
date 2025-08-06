using AccountsService.Services;

namespace AccountsService.Types;

public class Query
{
    public Account? GetAccountById(string id, [Service] AccountService accountService)
        => accountService.GetAccountById(id);

    public IEnumerable<Account> GetAccounts([Service] AccountService accountService)
        => accountService.GetAllAccounts();
}