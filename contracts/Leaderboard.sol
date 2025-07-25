// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Leaderboard {
    struct Score {
        address player;
        uint256 score;
        string username;
    }
    
    Score[] public scores;
    address public owner;
    
    event ScoreAdded(address indexed player, uint256 score, string username);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    function addScores(Score[] calldata newScores) external onlyOwner {
        for (uint i = 0; i < newScores.length; i++) {
            scores.push(newScores[i]);
            emit ScoreAdded(newScores[i].player, newScores[i].score, newScores[i].username);
        }
    }
    
    function getTopScores(uint count) external view returns (Score[] memory) {
        uint resultCount = count > scores.length ? scores.length : count;
        Score[] memory topScores = new Score[](resultCount);
        
        for (uint i = 0; i < resultCount; i++) {
            topScores[i] = scores[i];
        }
        
        return topScores;
    }
    
    function resetLeaderboard() external onlyOwner {
        delete scores;
    }
}
