import { CLICommandChecker } from '../../utils/setup/CLICommandChecker'; // Adjust the path to your class
import { exec } from 'child_process';

// Mock the exec function from 'child_process'
jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

describe('CLICommandChecker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when the command is available', async () => {
    // Mock exec to simulate a successful command execution
    exec.mockImplementation((cmd, callback) => {
      callback(null); // No error
    });

    const checker = new CLICommandChecker(['rawtherapee-cli']);
    const isAvailable = await checker.isCommandAvailable('rawtherapee-cli');

    expect(isAvailable).toBe(true);
  });

  it('should return false when the command is not available', async () => {
    // Mock exec to simulate a failed command execution
    exec.mockImplementation((cmd, callback) => {
      callback(new Error('Command not found')); // Simulate error
    });

    const checker = new CLICommandChecker(['rawtherapee-cli']);
    const isAvailable = await checker.isCommandAvailable('rawtherapee-cli');

    expect(isAvailable).toBe(false);
  });

  it('should correctly check all commands', async () => {
    // Mock exec for different commands
    exec.mockImplementation((cmd, callback) => {
      if (cmd === 'rawtherapee-cli') {
        callback(null); // Command available
      } else {
        callback(new Error('Command not found')); // Command not available
      }
    });

    const checker = new CLICommandChecker(['rawtherapee-cli','nonexistent-command']);
    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    await checker.checkAllCommands();

    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('✔ Command "rawtherapee-cli" is available.'));
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('✘ Command "nonexistent-command" is not available.'));

    mockLog.mockRestore();
  });
});
